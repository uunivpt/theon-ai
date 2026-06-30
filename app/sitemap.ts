import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://theonai.online",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://theonai.online/login",
      lastModified: new Date(),
    },
    {
      url: "https://theonai.online/signup",
      lastModified: new Date(),
    },
    {
      url: "https://theonai.online/chat",
      lastModified: new Date(),
    },
  ];
}