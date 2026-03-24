import { useEffect, useState, useRef } from "react";
import { Filter, ExternalLink, CheckCircle2, ChevronUp, Newspaper } from "lucide-react";

export default function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showTopBtn, setShowTopBtn] = useState(false);
  
  const intervalRef = useRef(null);

  // Deteksi scroll untuk tombol kembali ke atas
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchNews = async () => {
    const APIS = [
      { name: 'CNBC', url: 'https://api.nexray.web.id/berita/cnbcindonesia' },
      { name: 'CNN', url: 'https://api.nexray.web.id/berita/cnn' },
      { name: 'Kompas', url: 'https://api.nexray.web.id/berita/kompas' },
      { name: 'Sindo', url: 'https://api.nexray.web.id/berita/sindonews' },
      { name: 'Suara', url: 'https://api.nexray.web.id/berita/suara' }
    ];

    try {
      const fetchPromises = APIS.map(async (api) => {
        try {
          const res = await fetch(api.url);
          const data = await res.json();
          return (data.result || []).map((item) => ({
            title: item.title || 'Tanpa Judul',
            link: item.link || '#',
            image: item.image || item.image_thumbnail || item.imageUrl || 'https://via.placeholder.com/500x300?text=Warta+Utama',
            source: api.name,
            time: item.date || item.timestamp || item.time || 'Baru saja',
          }));
        } catch (err) { return []; }
      });

      const allResults = await Promise.all(fetchPromises);
      const mergedNews = allResults.flat().sort(() => Math.random() - 0.5);
      
      setNews(mergedNews);
      setFilteredNews(activeFilter === "Semua" ? mergedNews : mergedNews.filter(n => n.source === activeFilter));
    } catch (error) {
      console.error('Gagal memuat berita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    intervalRef.current = setInterval(fetchNews, 300000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleFilter = (source) => {
    setActiveFilter(source);
    setFilteredNews(source === "Semua" ? news : news.filter(item => item.source === source));
  };

  return (
    <div className="min-h-screen font-sans text-white bg-[#0a0a0c]">
      <style>{`
        body {
          background-image: 
            radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.05) 0%, transparent 50%);
          background-attachment: fixed;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-4 z-50 mx-4 md:mx-8 mb-8">
        <nav className="p-5 rounded-[24px] flex justify-between items-center bg-[#16161a]/80 backdrop-blur-xl border border-white/5 shadow-2xl">
          
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
                <Newspaper size={24} className="text-white" />
             </div>
             <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1 uppercase">
                <span className="text-white">Warta</span>
                <span className="text-red-500">Utama</span>
             </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest shadow-sm">
               <CheckCircle2 size={14}/> Live Feed Active
            </div>
          </div>
        </nav>
      </header>

      {/* FILTER BAR */}
      <div className="flex gap-2 overflow-x-auto px-4 md:px-8 pb-6 no-scrollbar mb-4 items-center max-w-7xl mx-auto">
        <Filter size={16} className="text-gray-500 shrink-0"/>
        {["Semua", "CNBC", "CNN", "Kompas", "Sindo", "Suara"].map((source) => (
          <button
            key={source}
            onClick={() => handleFilter(source)}
            className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 border ${
              activeFilter === source ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {source}
          </button>
        ))}
      </div>

      {/* GRID BERITA */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-80 bg-white/[0.02] border border-white/5 rounded-[32px] animate-pulse"></div>)
        ) : filteredNews.map((item, i) => (
          <article key={i} className="bg-[#16161a] rounded-[28px] overflow-hidden group hover:ring-2 hover:ring-red-600/30 transition-all duration-500 flex flex-col border border-white/5 shadow-xl relative">
            <div className="relative h-52 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-transparent"></div>
              <span className="absolute top-4 left-4 text-[10px] bg-red-600 px-3 py-1 rounded-lg text-white font-black uppercase shadow-lg">{item.source}</span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold leading-snug text-gray-100 group-hover:text-red-400 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {item.time}
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-white/5">
                <a href={item.link} target="_blank" rel="noreferrer" 
                   className="flex items-center justify-between w-full text-[12px] font-bold text-gray-300 hover:text-white transition-all group/btn">
                  BACA SELENGKAPNYA 
                  <span className="p-2 bg-white/5 rounded-full group-hover/btn:bg-red-600 transition-all">
                    <ExternalLink size={14}/>
                  </span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 bg-[#0e0e11] p-12 md:p-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="bg-red-600/10 p-4 rounded-3xl border border-red-600/20 mb-8">
            <Newspaper size={40} className="text-red-600" />
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">Warta <span className="text-red-600">Utama</span></h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-10">
            Pusat agregasi berita terpercaya yang menyajikan informasi terkini dari berbagai sumber media nasional secara real-time.
          </p>

          <div className="mt-10 pt-10 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
            <p className="text-[11px] font-medium tracking-wide">© 2026 WARTA UTAMA - INFORMASI TANPA BATAS</p>
            <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest">
              <span className="hover:text-red-500 cursor-pointer">Kebijakan Privasi</span>
              <span className="hover:text-red-500 cursor-pointer">Kontak</span>
              <span>v3.0 Stable</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-50 p-4 bg-red-600 text-white rounded-full shadow-2xl shadow-red-600/40 hover:scale-110 transition-all active:scale-95 animate-in fade-in zoom-in duration-300"
        >
          <ChevronUp size={24} />
        </button>
      )}

    </div>
  );
}