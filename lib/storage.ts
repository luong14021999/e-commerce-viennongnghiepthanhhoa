import { createClient } from "@/lib/supabase/client";

export async function uploadProductImages(files: File[], productId: string): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${productId}/${i}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (error) continue;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
