import { prisma } from "../../lib/prisma.js";

// ── YouTube Metadata Fetching ────────────────────────────────────

interface YouTubeOEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  type: string;
  html: string;
}

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  embedUrl: string;
}

function extractVideoId(url: string): string | null {
  // Support various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video URL.");
  }

  // Use YouTube oEmbed API (no API key required)
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch YouTube video metadata. The video may be private or unavailable.");
    }

    const data = (await response.json()) as YouTubeOEmbedResponse;

    return {
      videoId,
      title: data.title || "Untitled Video",
      channel: data.author_name || "Unknown Channel",
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("Failed to fetch")) {
      throw err;
    }
    // Fallback with just the video ID
    return {
      videoId,
      title: "YouTube Video",
      channel: "Unknown",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    };
  }
}

export async function attachYouTubeToLesson(
  lessonId: string,
  data: {
    ytVideoId: string;
    ytTitle?: string;
    ytThumbnail?: string;
    ytChannel?: string;
    ytDuration?: string;
    embedUrl?: string;
    teacherNotes?: string;
  }
) {
  // Upsert YouTube tutorial for the lesson
  return prisma.youtubeTutorial.upsert({
    where: { lessonId },
    create: {
      lessonId,
      ytVideoId: data.ytVideoId,
      ytTitle: data.ytTitle,
      ytThumbnail: data.ytThumbnail,
      ytChannel: data.ytChannel,
      ytDuration: data.ytDuration,
      embedUrl: data.embedUrl || `https://www.youtube.com/embed/${data.ytVideoId}`,
      teacherNotes: data.teacherNotes,
    },
    update: {
      ytVideoId: data.ytVideoId,
      ytTitle: data.ytTitle,
      ytThumbnail: data.ytThumbnail,
      ytChannel: data.ytChannel,
      ytDuration: data.ytDuration,
      embedUrl: data.embedUrl || `https://www.youtube.com/embed/${data.ytVideoId}`,
      teacherNotes: data.teacherNotes,
    },
  });
}

export async function removeYouTubeFromLesson(lessonId: string) {
  return prisma.youtubeTutorial.delete({
    where: { lessonId },
  });
}

// ── Bulk YouTube Import ──────────────────────────────────────────

interface BulkYouTubeItem {
  url: string;
  moduleId: string;
  teacherNotes?: string;
}

interface BulkYouTubeResult {
  successful: Array<{ videoId: string; title: string; lessonId: string }>;
  failed: Array<{ url: string; error: string }>;
}

export async function bulkImportYouTube(
  items: BulkYouTubeItem[]
): Promise<BulkYouTubeResult> {
  const successful: BulkYouTubeResult["successful"] = [];
  const failed: BulkYouTubeResult["failed"] = [];

  for (const item of items) {
    try {
      const metadata = await fetchYouTubeMetadata(item.url);

      // Create lesson with YouTube content type
      const lesson = await prisma.lesson.create({
        data: {
          title: metadata.title,
          contentType: "YOUTUBE",
          contentUrl: item.url,
          moduleId: item.moduleId,
          order: 999, // Will be reordered later
          isPublished: false,
          duration: 0,
        },
      });

      // Attach YouTube tutorial metadata
      await prisma.youtubeTutorial.create({
        data: {
          lessonId: lesson.id,
          ytVideoId: metadata.videoId,
          ytTitle: metadata.title,
          ytThumbnail: metadata.thumbnail,
          ytChannel: metadata.channel,
          embedUrl: metadata.embedUrl,
          teacherNotes: item.teacherNotes,
        },
      });

      successful.push({ videoId: metadata.videoId, title: metadata.title, lessonId: lesson.id });
    } catch (err) {
      failed.push({
        url: item.url,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { successful, failed };
}
