// File: src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { CheckCircle, XCircle, FileText, Clock, ExternalLink, Users, AlertCircle } from 'lucide-react';

interface Pendaftar {
    id: string;
    nama_lengkap: string;
    ktp_url: string;
    ijazah_url: string;
    status: string;
    waktu_kirim: Timestamp | null;
}

const AdminDashboard: React.FC = () => {
    const [dataPendaftar, setDataPendaftar] = useState<Pendaftar[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ambil Data Real-time dari Firebase
    useEffect(() => {
        const q = query(collection(db, "berkas_pendaftar"), orderBy("waktu_kirim", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Pendaftar[];

            setDataPendaftar(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fungsi Update Status
    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const docRef = doc(db, "berkas_pendaftar", id);
            await updateDoc(docRef, { status: newStatus });
        } catch (error) {
            console.error("Gagal update status:", error);
            alert("Terjadi kesalahan saat mengupdate status.");
        }
    };

    // Format Tanggal
    const formatDate = (timestamp: Timestamp | null) => {
        if (!timestamp) return '-';
        return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Styling Warna Status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Diterima': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Ditolak (Revisi)': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    // --- MENGHITUNG STATISTIK UNTUK KARTU UI ---
    const totalPendaftar = dataPendaftar.length;
    const totalMenunggu = dataPendaftar.filter(d => d.status === 'Menunggu Verifikasi').length;
    const totalDiterima = dataPendaftar.filter(d => d.status === 'Diterima').length;
    const totalDitolak = dataPendaftar.filter(d => d.status === 'Ditolak (Revisi)').length;

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-blue-500 font-bold text-xl">Memuat Dashboard Admin...</div></div>;

    return (
        <div className="max-w-7xl mx-auto p-6 mt-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Verifikasi</h2>
                    <p className="text-slate-500 mt-1">Pantau dan kelola semua berkas masuk di sini.</p>
                </div>
            </div>

            {/* --- KARTU STATISTIK (UI BARU) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mr-4">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Total Pendaftar</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalPendaftar}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mr-4">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Menunggu</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalMenunggu}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Diterima</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalDiterima}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mr-4">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Perlu Revisi</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalDitolak}</h3>
                    </div>
                </div>
            </div>

            {/* --- TABEL DATA --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-5">Waktu & Nama</th>
                                <th className="px-6 py-5 text-center">Dokumen KTP</th>
                                <th className="px-6 py-5 text-center">Dokumen Ijazah</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dataPendaftar.length > 0 ? (
                                dataPendaftar.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-400 flex items-center mb-1">
                                                <Clock className="w-3 h-3 mr-1" /> {formatDate(item.waktu_kirim)}
                                            </div>
                                            <div className="font-bold text-slate-800 text-base">{item.nama_lengkap}</div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <a href={item.ktp_url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl">
                                                <FileText className="w-5 h-5 mb-1" />
                                                <span className="text-[10px] font-bold flex items-center uppercase tracking-wider">Cek KTP <ExternalLink className="w-3 h-3 ml-1" /></span>
                                            </a>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <a href={item.ijazah_url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center text-amber-600 hover:text-amber-800 transition-colors bg-amber-50 px-4 py-2 rounded-xl">
                                                <FileText className="w-5 h-5 mb-1" />
                                                <span className="text-[10px] font-bold flex items-center uppercase tracking-wider">Cek Ijazah <ExternalLink className="w-3 h-3 ml-1" /></span>
                                            </a>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, 'Diterima')}
                                                    className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-200"
                                                    title="Terima Berkas"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, 'Ditolak (Revisi)')}
                                                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-200"
                                                    title="Tolak / Minta Revisi"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="font-bold">Belum ada data pendaftar masuk.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;