import { Bucket } from "encore.dev/storage/objects";

export const imagesBucket = new Bucket("comic-images", {
  public: true,
});
