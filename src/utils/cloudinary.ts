// File: src/utils/cloudinary.ts

// GANTI DENGAN NAMA CLOUD-MU (Lihat di Dashboard Cloudinary)
const CLOUD_NAME = "diwecbabq";

// GANTI DENGAN NAMA PRESET-MU (Yang tadi disetting: pemberkasan_preset)
const UPLOAD_PRESET = "pemberkasan_preset";

export const uploadToCloudinary = async (file: File): Promise<string> => {
    // Cloudinary butuh data dalam bentuk FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        // Kita tembak API Cloudinary langsung dari Frontend (Unsigned Upload)
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Gagal upload ke Cloudinary");
        }

        const data = await response.json();

        // Mengembalikan Link URL file yang sudah online!
        return data.secure_url;

    } catch (error) {
        console.error("Error saat upload:", error);
        throw error;
    }
};