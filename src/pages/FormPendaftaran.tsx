// File: src/pages/FormPendaftaran.tsx
import React, { useState } from 'react';
import { CheckCircle, Loader2, FileText, Send, User, ShieldCheck } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FormPendaftaran: React.FC = () => {
    const [nama, setNama] = useState('');
    const [fileKtp, setFileKtp] = useState<File | null>(null);
    const [fileIjazah, setFileIjazah] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Menghitung persentase progress
    const calculateProgress = () => {
        let p = 0;
        if (nama.length > 2) p += 34; // Ketik nama minimal 3 huruf
        if (fileKtp) p += 33;
        if (fileIjazah) p += 33;
        return p;
    };
    const progress = calculateProgress();

    // --- FUNGSI VALIDASI FILE ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setter(null);
            return;
        }

        // 1. Validasi Ukuran (Maksimal 2 MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("⚠️ Ukuran file terlalu besar! Maksimal 2MB.");
            e.target.value = ''; 
            setter(null);
            return;
        }

        // 2. Validasi Format File
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert("⚠️ Format file ditolak! Hanya boleh upload JPG, PNG, atau PDF.");
            e.target.value = ''; 
            setter(null);
            return;
        }

        setter(file);
    };

    // Logic Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama || !fileKtp || !fileIjazah) {
            alert("Harap lengkapi semua isian dan file!");
            return;
        }

        setIsSubmitting(true);

        try {
            const ktpUrl = await uploadToCloudinary(fileKtp);
            const ijazahUrl = await uploadToCloudinary(fileIjazah);

            await addDoc(collection(db, "berkas_pendaftar"), {
                nama_lengkap: nama,
                ktp_url: ktpUrl,
                ijazah_url: ijazahUrl,
                status: "Menunggu Verifikasi",
                waktu_kirim: serverTimestamp(),
            });

            setIsSuccess(true);
        } catch (error) {
            console.error("Gagal mengirim data:", error);
            alert("Terjadi kesalahan saat mengirim data. Cek koneksi internetmu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tampilan Sukses (Mewah)
    if (isSuccess) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-emerald-100 transform transition-all hover:-translate-y-2 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-14 h-14 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">Berkas Terkirim!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">Terima kasih, <span className="font-bold text-slate-700">{nama}</span>. Berkasmu telah masuk ke brankas digital kami dan sedang menunggu verifikasi admin.</p>
                    <button onClick={() => window.location.reload()} className="w-full bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center">
                        Kirim Berkas Lainnya
                    </button>
                </div>
            </div>
        );
    }

    // Tampilan Form Utama
    return (
        <div className="min-h-[90vh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Portal Pemberkasan</h2>
                    <p className="text-slate-500 text-lg">Lengkapi 3 langkah mudah di bawah ini.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 px-1">
                        <span>Progress Kelengkapan</span>
                        <span className={progress === 100 ? 'text-emerald-500' : 'text-blue-600'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
                        <div 
                            className={`h-3.5 rounded-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Input Nama */}
                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${nama.length > 2 ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <label className="font-bold text-slate-700 flex items-center text-lg">
                                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mr-3 text-sm">1</span>
                                    Nama Lengkap
                                </label>
                                {nama.length > 2 ? <CheckCircle className="w-6 h-6 text-blue-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                            </div>
                            <div className="relative">
                                <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    placeholder="Sesuai KTP / Ijazah"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* 2. Upload KTP */}
                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${fileKtp ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-emerald-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <label className="font-bold text-slate-700 flex items-center text-lg">
                                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mr-3 text-sm">2</span>
                                    Dokumen KTP
                                </label>
                                {fileKtp ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, application/pdf"
                                    onChange={(e) => handleFileChange(e, setFileKtp)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-colors"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">Format: JPG, PNG, PDF (Maks. 2MB)</p>
                        </div>

                        {/* 3. Upload Ijazah */}
                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${fileIjazah ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-amber-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <label className="font-bold text-slate-700 flex items-center text-lg">
                                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-600 mr-3 text-sm">3</span>
                                    Dokumen Ijazah
                                </label>
                                {fileIjazah ? <CheckCircle className="w-6 h-6 text-amber-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, application/pdf"
                                    onChange={(e) => handleFileChange(e, setFileIjazah)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer transition-colors"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">Format: JPG, PNG, PDF (Maks. 2MB)</p>
                        </div>

                        {/* Tombol Submit Utama */}
                        <button
                            type="submit"
                            disabled={isSubmitting || progress < 100}
                            className={`w-full mt-8 flex items-center justify-center py-4 rounded-2xl font-black text-lg text-white transition-all duration-300 ${
                                progress < 100
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200'
                            }`}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Mengenkripsi & Mengirim...</>
                            ) : (
                                <><Send className="w-6 h-6 mr-3" /> {progress < 100 ? 'Lengkapi Data Dulu' : 'Kirim Berkas Sekarang'}</>
                            )}
                        </button>

                    </form>
                </div>
                
                <p className="text-center text-sm font-semibold text-slate-400 mt-8">
                    Sistem Pemberkasan Digital Terenkripsi © 2026
                </p>
            </div>
        </div>
    );
};

export default FormPendaftaran;