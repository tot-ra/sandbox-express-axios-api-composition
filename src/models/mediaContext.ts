import axios from "axios";
type UUID = string;

type MediaContext = {
  id: UUID;
  mediaId: UUID;
  context: string;
  probability: number;
};

type Media = {
  id: UUID;
  mimeType: string;
  context: string;
};

export type ApiGetSessionResponse = {
  front: any[];
  back: any[];
};

export async function getMergedMediaContext(
  sessionId: string
): Promise<ApiGetSessionResponse> {
  const [media, context] = await Promise.all([
    //axios.get(`https://api.veriff.internal/sessions/${sessionId}`),
    axios.get(`https://api.veriff.internal/sessions/${sessionId}/media`),
    axios.get(`https://api.veriff.internal/media-context/${sessionId}`),
  ]);

  const mediaSet: Map<string, Media> = new Map();

  for (const row of media.data as Media[]) {
    mediaSet.set(row.id, row);
  }

  const filteredData = (context.data as MediaContext[])
    .filter((obj) => obj.context !== "none")
    .sort((a, b) => b.probability - a.probability)
    .map((row: MediaContext) => {
      return {
        ...row,
        mimeType: mediaSet.get(row.mediaId)?.mimeType,
      };
    })
    .reduce((acc, cur) => {
      const key = cur.context;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(cur);
      return acc;
    }, {});

  return filteredData as ApiGetSessionResponse;
}
