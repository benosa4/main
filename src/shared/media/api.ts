export interface PresignRequest { filename: string; mime: string }
export interface PresignResponse { uploadUrl: string; fileUrl: string; headers?: Record<string,string> }

export async function presignForUpload(req: PresignRequest): Promise<PresignResponse> {
  // mock presign: generate fake S3 URLs; in real life call REST: POST /files/presign
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const uploadUrl = `https://mock-storage/upload/${id}?filename=${encodeURIComponent(req.filename)}`;
  const fileUrl = `https://mock-storage/files/${id}/${encodeURIComponent(req.filename)}`;
  return { uploadUrl, fileUrl, headers: { 'x-mock': '1' } };
}

