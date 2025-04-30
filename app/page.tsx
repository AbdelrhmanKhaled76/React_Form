"use client";

import Image from "next/image";
import image from "../public/abdo2.jpg";
import { Oswald, Roboto } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubAlt, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import toast from "react-hot-toast";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const ALLOWED_TYPES: string[] = ["image/jpeg", "image/png", "image/jpg"];
const ALLOWED_SIZE: number = 2;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image?: string;
  gender: string;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const selectedFile = useRef<File>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [errors, setErrors] = useState<FormData>();
  const [validationError, setValidationError] = useState<string>("");
  const [selectFileName, setSelectFileName] =
    useState<string>("select a picture");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    password: "",
    email: "",
    gender: "",
  });

  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      gender: "",
    });
    setProfileImage("");
    setValidationError("");
    setSelectFileName("select a picture");
    setErrors(undefined);
  };

  const validate = (): boolean => {
    const newErrors: FormData = {} as FormData;
    if (!formData.firstName) newErrors.firstName = "first name is required";
    if (!formData.lastName) newErrors.lastName = "last name is required";
    if (!formData.email) newErrors.email = "email is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password too short";
    if (!formData.gender) newErrors.gender = "gender is required";
    if (validationError) newErrors.image = validationError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value }: { name: string; value: string } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validate();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const Image = (e.target.files?.[0] as File) || null;
    if (!Image) {
      setProfileImage("");
      setSelectFileName("select a picture");
      setValidationError("no image selected");
      validate();
      return;
    }
    if (!ALLOWED_TYPES.includes(Image.type)) {
      setProfileImage("");
      setValidationError("invalid image type");
      setSelectFileName("select a picture");
      validate();
      return;
    }
    if (Image.size / (1024 * 1024) > ALLOWED_SIZE) {
      setProfileImage("");
      setValidationError(`Image must be smaller than ${ALLOWED_SIZE}MB`);
      setSelectFileName("select a picture");
      validate();
      return;
    }
    const image: string = URL.createObjectURL(Image);
    setValidationError("");
    setProfileImage(image);
    setSelectFileName(Image.name);
    selectedFile.current = Image;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate first before setting loading state
    if (!profileImage) {
      setValidationError("image field is required");
      validate();
      return;
    }

    if (!validate()) return; // Don't proceed if validation fails

    setLoading(true); // Now we're sure we'll make the API call
    const form = new FormData();

    try {
      // Prepare form data
      for (const [key, val] of Object.entries(formData)) {
        if (val) form.append(key, String(val));
      }

      if (selectedFile.current) {
        form.append("image", selectedFile.current);
      }

      // Make API call
      const res = await fetch(`/api/register`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      const response = await res.json();
      toast.success(response.message || "Registration successful!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  return (
    <>
      <main
        className={`fixed h-screen w-screen flex justify-center items-center bg-[rgba(0,0,0,0.5)] ${roboto.className}`}
      >
        <form
          className="w-[500px] min-h-[600px]  bg-white rounded-3xl shadow-xl p-1"
          onSubmit={handleSubmit}
        >
          <div className="bg-[#F3F3F3] w-full rounded-3xl py-12 px-4 mx-auto">
            <figure>
              <Image
                src={image}
                alt="user picture"
                className="w-[80px] h-[80px] object-cover rounded-full border-4 border-white bg-white"
              ></Image>
            </figure>

            <button
              type="button"
              className={`border px-2 py-1 rounded flex justify-end items-center ms-auto border-gray-300 ${
                isCopied ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => {
                const url: string = window.location.href;
                navigator.clipboard.writeText(url);
                setIsCopied(true);
              }}
              disabled={isCopied}
            >
              {!isCopied ? "🔗 Copy link" : "✅ Copied"}
            </button>

            <article>
              <h2 className={`${oswald.className} text-2xl capitalize`}>
                abdelrhman khaled
              </h2>
              <p className="pt-3 text-sm text-gray-700">
                bodi.khaled@gmail.com
              </p>
            </article>
            <hr className="my-5 text-gray-300" />
            <section className="flex justify-between items-center">
              <label htmlFor="firstName" className={oswald.className}>
                Name
              </label>
              <div className="flex justify-between gap-6">
                <input
                  title="first-name"
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="border border-gray-300 transition-colors duration-500 w-[150px] rounded-lg p-1"
                  onChange={handleChange}
                  required
                />
                <input
                  title="last-name"
                  type="text"
                  name="lastName"
                  className="border border-gray-300 transition-colors duration-500 w-[150px] rounded-lg p-1"
                  onChange={handleChange}
                  required
                />
              </div>
            </section>
            <hr className="my-5 text-gray-300" />
            <section className="flex justify-between items-center ">
              <label htmlFor="Email" className={oswald.className}>
                Email address
              </label>
              <div className="relative ms-auto">
                <input
                  type="email"
                  id="Email"
                  name="email"
                  className="w-[324px] pl-10 pr-4 py-1 border rounded-lg border-gray-300 transition-colors duration-500"
                  onChange={handleChange}
                  required
                />
                <figure className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                  ✉
                </figure>
              </div>
            </section>
            <hr className="my-5 text-gray-300" />
            <div className="flex justify-between items-center ">
              <label htmlFor="Password" className={oswald.className}>
                Password
              </label>
              <section className="relative ms-auto">
                <input
                  type="password"
                  id="Password"
                  name="password"
                  className="w-[324px] pl-10 pr-4 py-1 border rounded-lg border-gray-300 transition-colors duration-500"
                  onChange={handleChange}
                  required
                />
                <figure className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                  🔒
                </figure>
                {formData.password ? (
                  <figure
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-md cursor-pointer"
                    onClick={() => {
                      const passValue = document.querySelector(
                        "#Password"
                      ) as HTMLInputElement;
                      passValue.value = "";
                      setFormData((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }}
                  >
                    ❌
                  </figure>
                ) : (
                  ""
                )}
              </section>
            </div>
            <hr className="my-5 text-gray-300" />
            <section className="flex justify-between items-center ">
              <label htmlFor="profile-pic" className={oswald.className}>
                Profile Picture
              </label>
              <figure className="flex justify-between items-center gap-5">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="user picture"
                    width={50}
                    height={50}
                    className="object-cover rounded-full border-4 aspect-square border-white bg-white ms-auto"
                  ></Image>
                ) : (
                  ""
                )}
                <input
                  type="file"
                  id="profile-pic"
                  className="hidden"
                  name="profilePic"
                  onChange={handleFile}
                />
                <label
                  htmlFor="profile-pic"
                  className="w-[150px] pr-2 py-2 border text-center rounded-lg border-gray-300 cursor-pointer text-sm"
                >
                  {selectFileName.length > 20
                    ? selectFileName.slice(0, 15) + " ..."
                    : selectFileName}
                </label>
              </figure>
            </section>
            <hr className="my-5 text-gray-300" />
            <section className="flex justify-between items-center ">
              <p className={oswald.className}>Gender</p>
              <div className="flex justify-between items-center gap-5">
                <div className="flex justify-between gap-2">
                  <label htmlFor="male">Male</label>
                  <input
                    name="gender"
                    type="radio"
                    id="male"
                    onChange={handleChange}
                    className="accent-black"
                    value={"male"}
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <label htmlFor="female">Female</label>
                  <input
                    name="gender"
                    type="radio"
                    id="female"
                    value={"female"}
                    onChange={handleChange}
                    className="accent-black"
                  />
                </div>
              </div>
            </section>
            <hr className="my-5 text-gray-300" />
            {errors ? (
              <div className="flex justify-center items-center pb-5">
                <p className="text-sm text-red-500">
                  {errors.firstName ||
                    errors.email ||
                    errors.lastName ||
                    errors.password ||
                    errors.image}
                </p>
              </div>
            ) : (
              ""
            )}
            <section className="flex justify-between items-center ">
              <figure className="flex justify-between items-center gap-2">
                <a
                  href="https://github.com/AbdelrhmanKhaled76"
                  target="_blank"
                  title="github link"
                  rel="noopener"
                >
                  <FontAwesomeIcon
                    icon={faGithubAlt}
                    className="text-2xl p-1 rounded-full cursor-pointer"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/abdelrhmankhaledmohamed76/"
                  target="_blank"
                  title="linked_in link"
                  rel="noopener"
                >
                  <FontAwesomeIcon
                    icon={faLinkedinIn}
                    className="text-2xl p-1 rounded-full  cursor-pointer"
                  />
                </a>
              </figure>
              <div className="flex justify-between items-center gap-5">
                <button
                  type="reset"
                  className="border rounded-lg border-gray-300 cursor-pointer py-2 px-4"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className={`border rounded-lg border-gray-300 text-white bg-black ${
                    loading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer opacity-100"
                  }  py-2 px-4`}
                >
                  {loading ? "Loading ..." : "Save Changes"}
                </button>
              </div>
            </section>
          </div>
        </form>
      </main>
    </>
  );
}
