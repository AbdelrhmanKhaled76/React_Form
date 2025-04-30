import { MongoClient } from "mongodb";
import { ValueOf } from "next/dist/shared/lib/constants";

interface UserData {
  firstName: string;
  lastName: string;
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
    const data: Partial<UserData> = {};

    // Process form data
    for (const [key, value] of formData.entries()) {
      data[key as keyof UserData] = value;
    }

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
