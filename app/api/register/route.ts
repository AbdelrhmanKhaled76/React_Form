import { hashSync } from "bcryptjs";
import { MongoClient } from "mongodb";
import { ValueOf } from "next/dist/shared/lib/constants";

interface UserData {
  firstName: string;
  lastName: string;
  password: string;
  image: Blob;
  gender: string;
  email: string;
}

async function POST(req: Request) {
  let client: MongoClient | null = null;
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // Get form data
    const formData = await req.formData();

    const parseFormData = (formData: FormData): Partial<UserData> => {
      const result: Partial<UserData> = {};

      // Handle image separately
      const image = formData.get("image");
      if (image instanceof File) {
        result.image = image;
      }

      // Handle string fields
      const stringFields: Array<keyof Omit<UserData, "image">> = [
        "firstName",
        "lastName",
        "email",
        "password",
        "gender",
      ];

      for (const field of stringFields) {
        const value = formData.get(field);
        if (typeof value === "string") {
          result[field] = value;
        }
      }

      return result;
    };

    const data = parseFormData(formData);
    // Process form data
    for (const [key, value] of formData.entries()) {
      // Skip if key doesn't exist in UserData
      if (!(key in data)) continue;

      // Special handling for File/Blob fields
      if (key === "image") {
        if (value instanceof File) {
          data.image = value;
        }
        continue;
      }

      // Handle all string fields
      if (typeof value === "string") {
        // Type-safe assignment using a type guard
        switch (key) {
          case "firstName":
          case "lastName":
          case "email":
          case "password":
          case "gender":
            data[key] = value;
            break;
        }
      }
    }

    data.password = hashSync(data.password as string, 10);

    // Validate we have all required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert into database
    const db = client.db("react_register");
    const collection = db.collection("register");
    const result = await collection.insertOne(data as UserData);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.insertedId,
        message: "data is inserted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    // Close the connection
    if (client) {
      await client.close();
    }
  }
}

export { POST };
