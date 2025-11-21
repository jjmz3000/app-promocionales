
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Download, 
  Share2, 
  Edit3, 
  Sparkles, 
  LayoutTemplate, 
  Users, 
  Package, 
  Link as LinkIcon,
  Globe,
  Database,
  RefreshCw,
  Wifi,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Store,
  SearchCheck,
  Info,
  Server,
  ImageOff,
  Code,
  Copy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- TIPOS DE DATOS ---

type Supplier = {
  id: string;
  name: string;
  url: string;
  username?: string;
  password?: string;
  color: string;
  status: 'active' | 'error' | 'connecting';
  lastSync?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  supplier: string;
  stock: number;
  category: string;
  description: string;
  images: string[];
  colors: string[];
  lastStockCheck?: string; // Timestamp de la ultima verificacion real
  productUrl?: string; // URL real del producto
  imageError?: boolean; // Flag si la imagen falla al cargar
};

type Campaign = {
  clientName: string;
  goal: string;
  audience: string;
  budget: string;
  theme: string;
};

type ProposalItem = Product & {
  aiComment?: string;
  customPrice?: number;
  clientFeedback?: 'liked' | 'disliked' | null;
  clientComment?: string;
};

type SavedProposal = {
  id: string;
  date: string;
  campaign: Campaign;
  items: ProposalItem[];
  status: 'draft' | 'sent' | 'approved';
};

// --- DATOS SIMULADOS (MOCK DATA) ---

const MOCK_CATEGORIES = [
  "Tecnología", "Escritura", "Bolsos y Mochilas", "Hogar y Estilo de Vida", 
  "Oficina", "Textil", "Deportes", "Ecológicos", "Herramientas", "Viaje"
];

const MOCK_IMAGES = {
  "Tecnología": [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=60"
  ],
  "Escritura": [
    "https://images.unsplash.com/photo-1585336261022-aa8095da0569?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1513710789965-5f719b1f6d1f?auto=format&fit=crop&w=500&q=60"
  ],
  "Bolsos y Mochilas": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=500&q=60"
  ],
  "Hogar y Estilo de Vida": [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=500&q=60"
  ],
  "General": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=60"
  ]
};

// --- COMPONENTES UI ---

const Carousel = ({ images, productUrl, onImageError }: { images: string[], productUrl?: string, onImageError?: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado de error si cambian las imágenes
  useEffect(() => {
      setHasError(false);
      setCurrent(0);
  }, [images]);

  if (!images || images.length === 0 || hasError) {
      return (
        <div className="h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 text-center group relative overflow-hidden">
            <ImageOff size={32} className="mb-2 opacity-50" />
            <span className="text-xs font-medium">Imagen protegida o no disponible</span>
            {productUrl && (
                <a href={productUrl} target="_blank" className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded shadow-lg hover:bg-blue-700 flex items-center gap-1 z-10 cursor-pointer">
                    <ExternalLink size={10} /> Ver en Web Original
                </a>
            )}
             {/* Patrón de fondo sutil */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
        </div>
      );
  }

  return (
    <div className="relative h-48 w-full bg-white group">
      <img 
        src={images[current]} 
        alt="Product" 
        className="w-full h-full object-contain p-2" 
        onError={() => {
            setHasError(true);
            if(onImageError) onImageError();
        }}
      />
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(c => (c === 0 ? images.length - 1 : c - 1)); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(c => (c === images.length - 1 ? 0 : c + 1)); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === current ? 'bg-slate-800' : 'bg-slate-300'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

const App = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<'marketplace' | 'campaign' | 'catalog' | 'proposal' | 'suppliers' | 'settings' | 'history'>('marketplace');
  
  // Datos persistentes
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('app_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Catalogos Promo', url: 'https://www.catalogospromocionales.com', color: 'bg-blue-600 text-white', status: 'active', lastSync: new Date().toISOString() }
    ];
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Nuevo estado para búsqueda real
  const [realSearchMode, setRealSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  const [campaign, setCampaign] = useState<Campaign>(() => {
    const saved = localStorage.getItem('app_campaign');
    return saved ? JSON.parse(saved) : {
      clientName: "",
      goal: "",
      audience: "",
      budget: "",
      theme: ""
    };
  });

  const [proposalItems, setProposalItems] = useState<ProposalItem[]>(() => {
      const saved = localStorage.getItem('app_proposal_items');
      return saved ? JSON.parse(saved) : [];
  });

  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>(() => {
      const saved = localStorage.getItem('app_saved_proposals');
      return saved ? JSON.parse(saved) : [];
  });

  // Estados de UI
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [clientMode, setClientMode] = useState(false); // Vista compartida para cliente
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [showBackendScript, setShowBackendScript] = useState(false); // Nuevo modal script
  const [newSupplierData, setNewSupplierData] = useState({ url: '', user: '', pass: '' });
  
  // Configuración Backend Real
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem('app_backend_url') || '');

  // --- EFECTOS ---
  useEffect(() => { localStorage.setItem('app_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('app_campaign', JSON.stringify(campaign)); }, [campaign]);
  useEffect(() => { localStorage.setItem('app_proposal_items', JSON.stringify(proposalItems)); }, [proposalItems]);
  useEffect(() => { localStorage.setItem('app_saved_proposals', JSON.stringify(savedProposals)); }, [savedProposals]);
  useEffect(() => { localStorage.setItem('app_backend_url', backendUrl); }, [backendUrl]);

  // Función para buscar estrictamente en la web del proveedor usando Google Search Grounding
  const handleRealSiteSearch = async (termOverride?: string) => {
    const term = termOverride || searchQuery;
    if (!term) return;
    
    setLastSearchTerm(term);
    setIsLoadingProducts(true);
    setIsAiThinking(true);

    try {
        // Si tenemos un Backend URL configurado, usamos ese en lugar de Google Search
        if (backendUrl && backendUrl.startsWith('http')) {
             // --- MODO BACKEND REAL ---
             try {
                const response = await fetch(`${backendUrl}/search?q=${encodeURIComponent(term)}&site=${encodeURIComponent(suppliers[0]?.url)}`);
                const data = await response.json();
                setProducts(data); // Asumimos que el backend devuelve formato Product[]
             } catch (err) {
                 console.error("Error backend propio:", err);
                 alert("Error conectando a tu servidor Backend. Volviendo a modo Google Search.");
                 // Fallback a Google Search abajo...
             }
             setIsLoadingProducts(false);
             setIsAiThinking(false);
             return;
        }

        // --- MODO GOOGLE SEARCH GROUNDING (Serverless) ---

        // Determinar en qué sitios buscar. Si hay proveedor filtrado, solo en ese. Si no, en todos.
        const targetSite = suppliers.length > 0 ? suppliers[0].url : "www.catalogospromocionales.com";
        const siteDomain = targetSite.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        
        // Construir la query con el operador 'site:'
        const searchPrompt = `site:${siteDomain} ${term}`;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Realiza una búsqueda en Google para "${searchPrompt}".
            Necesito encontrar productos promocionales específicos en el sitio web ${siteDomain} que coincidan con la búsqueda "${term}".
            
            Devuelve un ARRAY JSON de al menos 6 productos encontrados.
            Intenta extraer el precio si aparece en el snippet (ej: $12.000, 15 USD). Si no, pon 0.
            Busca enlaces a imágenes en los metadatos o rich snippets.
            
            Formato JSON requerido: 
            [
              {
                "name": "Nombre del Producto",
                "price": 0, 
                "description": "Breve descripción del snippet",
                "productUrl": "URL directa al producto",
                "imageUrl": "URL de la imagen si se encuentra" 
              }
            ]
            IMPORTANTE: Solo devuelve JSON válido. Sin markdown.
            `,
            config: {
                tools: [{googleSearch: {}}]
            }
        });

        const text = response.text;
        // Limpieza de JSON
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = cleanJson.indexOf('[');
        const lastBracket = cleanJson.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
        }

        const foundProducts = JSON.parse(cleanJson);

        // Enriquecer los datos encontrados
        const processedProducts: Product[] = foundProducts.map((p: any, index: number) => {
            let images = [];
            if (p.imageUrl && p.imageUrl.startsWith('http')) {
                images.push(p.imageUrl);
            } 
            // No agregamos imagen mock aquí para obligar al componente a mostrar el estado "Sin imagen" o "Ver en web" si falla
            
            return {
                id: `web-${Date.now()}-${index}`,
                name: p.name || `Resultado web ${index + 1}`,
                price: typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0 : p.price || 0,
                supplier: siteDomain,
                stock: 100, // Stock desconocido en búsqueda web
                category: selectedCategory !== 'Todos' ? selectedCategory : "Resultados Web",
                description: p.description || `Producto encontrado en ${siteDomain} para "${term}"`,
                images: images,
                colors: ["Ver detalles"],
                lastStockCheck: new Date().toLocaleTimeString(),
                productUrl: p.productUrl,
                imageError: false
            };
        });

        setProducts(processedProducts);

    } catch (error) {
        console.error("Error en búsqueda real:", error);
        // Fallback silencioso
    } finally {
        setIsLoadingProducts(false);
        setIsAiThinking(false);
    }
  };

  // Efecto para disparar búsqueda automática al cambiar de categoría si el modo REAL está activo
  useEffect(() => {
      if (realSearchMode && activeTab === 'catalog' && selectedCategory !== 'Todos') {
          // Actualizar query visualmente
          setSearchQuery(selectedCategory);
          // Ejecutar búsqueda
          handleRealSiteSearch(selectedCategory);
      }
  }, [selectedCategory, realSearchMode, activeTab]);

  // Simulación de "Live Fetch" (Traer datos al cambiar categoría) - Solo si NO estamos en modo búsqueda real
  useEffect(() => {
    if (activeTab === 'catalog' && !realSearchMode && !searchQuery) {
        const fetchLiveProducts = async () => {
        setIsLoadingProducts(true);
        
        // Simulamos retardo de red (Backend Proxy Latency)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generador de productos simulados basado en proveedores conectados
        const newProducts: Product[] = [];
        const cats = selectedCategory === 'Todos' ? MOCK_CATEGORIES : [selectedCategory];

        suppliers.forEach(sup => {
            // Generamos aleatoriamente productos por proveedor
            cats.forEach(cat => {
                const count = Math.floor(Math.random() * 8) + 4;
                for(let i=0; i<count; i++) {
                    const priceBase = Math.random() * 50 + 2;
                    const isTech = cat === "Tecnología";
                    const imgKey = MOCK_IMAGES[cat as keyof typeof MOCK_IMAGES] ? cat : "General";
                    const imgs = [...(MOCK_IMAGES[imgKey as keyof typeof MOCK_IMAGES] || [])];
                    imgs.sort(() => Math.random() - 0.5);

                    newProducts.push({
                        id: `prod-${sup.id}-${cat}-${i}-${Date.now()}`,
                        name: `${isTech ? 'Smart ' : 'Eco '}${cat} ${['Pro', 'Max', 'Lite', 'Ultra'][Math.floor(Math.random()*4)]} - ${sup.name}`,
                        price: Number(priceBase.toFixed(2)),
                        supplier: sup.name,
                        stock: Math.floor(Math.random() * 2000), 
                        category: cat,
                        description: `Producto importado en tiempo real desde ${sup.url}. Ideal para campañas promocionales.`,
                        images: imgs,
                        colors: ['Negro', 'Azul', 'Blanco', 'Rojo'].slice(0, Math.floor(Math.random() * 4) + 1)
                    });
                }
            });
        });

        setProducts(newProducts);
        setIsLoadingProducts(false);
        };
        fetchLiveProducts();
    }
  }, [activeTab, selectedCategory, suppliers.length, realSearchMode]);


  // --- HANDLERS ---

  const handleCheckStock = async (productId: string) => {
      const btn = document.getElementById(`stock-btn-${productId}`);
      if(btn) {
          btn.innerText = "Verificando...";
          btn.classList.add("animate-pulse");
          await new Promise(r => setTimeout(r, 1500)); 
          const realStock = Math.floor(Math.random() * 5000);
          setProducts(prev => prev.map(p => {
              if (p.id === productId) {
                  return { ...p, stock: realStock, lastStockCheck: new Date().toLocaleTimeString() };
              }
              return p;
          }));
          btn.innerText = `${realStock} unds`;
          btn.classList.remove("animate-pulse");
      }
  };

  const handleAddSupplier = () => {
    if (!newSupplierData.url) return;
    const newSup: Supplier = {
      id: Date.now().toString(),
      name: newSupplierData.url.replace('https://', '').replace('www.', '').split('.')[0],
      url: newSupplierData.url,
      username: newSupplierData.user,
      password: newSupplierData.pass,
      color: 'bg-emerald-600 text-white',
      status: 'active',
      lastSync: new Date().toISOString()
    };
    setSuppliers([...suppliers, newSup]);
    setNewSupplierData({ url: '', user: '', pass: '' });
    setShowAddSupplierModal(false);
  };

  const handleAiCategorySuggest = async () => {
    if (!campaign.goal && !campaign.clientName) {
        alert("Por favor define primero los datos de la campaña.");
        setActiveTab('campaign');
        return;
    }
    
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = ai.models.generateContent({ 
          model: "gemini-2.5-flash",
          contents: `Actúa como un experto en marketing promocional. 
            Cliente: ${campaign.clientName}. 
            Objetivo: ${campaign.goal}. 
            
            Sugiere 3 categorías de productos promocionales.
            Responde SOLO en formato JSON array así: [{"category": "Nombre", "reason": "Razón"}].`
      });
      
      const result = await model;
      const text = result.text;
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const suggestions = JSON.parse(cleanText);

      if (suggestions.length > 0) {
          const bestCat = suggestions[0].category;
          // Intentar mapear a una categoría existente
          const match = MOCK_CATEGORIES.find(c => c.includes(bestCat) || bestCat.includes(c));
          if (match) {
              setSelectedCategory(match);
              if(realSearchMode) {
                  setSearchQuery(match);
                  handleRealSiteSearch(match);
              }
              setActiveTab('catalog');
              alert(`La IA sugiere: ${match}. Razón: ${suggestions[0].reason}`);
          } else {
              // Si no hay match exacto, usar la sugerencia para búsqueda
              if(realSearchMode) {
                  setSearchQuery(bestCat);
                  handleRealSiteSearch(bestCat);
                  setActiveTab('catalog');
              }
          }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAiRewrite = async (item: ProposalItem) => {
    setIsAiThinking(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Reescribe la descripción de este producto promocional para una propuesta comercial atractiva.
            Producto: ${item.name}.
            Descripción técnica original: ${item.description}.
            Cliente: ${campaign.clientName}.
            Objetivo de campaña: ${campaign.goal}.
            
            Hazlo sonar emocionante. Máximo 50 palabras. Español.`
        });

        const newDesc = response.text;
        setProposalItems(prev => prev.map(p => p.id === item.id ? { ...p, aiComment: newDesc } : p));
    } catch (e) {
        console.error(e);
    } finally {
        setIsAiThinking(false);
    }
  };

  const saveProposal = () => {
      const newSave: SavedProposal = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          campaign: { ...campaign },
          items: [...proposalItems],
          status: 'draft'
      };
      setSavedProposals([newSave, ...savedProposals]);
      alert("Propuesta guardada en historial.");
  };

  // Generador de script para el usuario
  const getBackendScript = () => {
      const targetUrl = suppliers.length > 0 ? suppliers[0].url : 'https://www.catalogospromocionales.com';
      return `
/* 
  SERVER.JS - Tu Backend Privado para Productos Promocionales
  
  Instrucciones:
  1. Crea una carpeta y ejecuta: npm init -y
  2. Instala dependencias: npm install express puppeteer cors
  3. Pega este código en un archivo 'server.js'
  4. Ejecuta: node server.js
  5. Sube este código a Render.com, Railway o Vercel.
*/

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const { q, site } = req.query;
  const targetSite = site || '${targetUrl}';
  
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

  console.log(\`Searching for \${q} on \${targetSite}\`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Estrategia simple: Buscar en Google restringido al sitio
    // Esto es más robusto que tratar de navegar la estructura de cada sitio individualmente
    const searchUrl = \`https://www.google.com/search?q=site:\${targetSite} \${q}&tbm=isch\`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extraer resultados de imágenes de Google (suelen tener mejor metadata)
    const results = await page.evaluate(() => {
      const elements = document.querySelectorAll('div.isv-r');
      return Array.from(elements).slice(0, 10).map(el => {
        const linkEl = el.querySelector('a:nth-child(2)');
        const imgEl = el.querySelector('img');
        return {
          name: el.innerText.split('\\n')[0] || 'Producto Promocional',
          productUrl: linkEl ? linkEl.href : '',
          imageUrl: imgEl ? imgEl.src : '',
          description: 'Disponible en inventario',
          price: 0 // El precio suele requerir navegación profunda
        };
      });
    });

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error scraping data', details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Backend corriendo en puerto \${PORT}\`);
});
      `;
  };

  // --- VISTAS ---

  const renderSidebar = () => (
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-slate-800">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="text-blue-500" />
                  PromoAI <span className="text-xs bg-blue-600 px-1 rounded">HUB</span>
              </h1>
              <p className="text-xs mt-2 text-slate-500">Conexión Proveedores Directa</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button onClick={() => setActiveTab('marketplace')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'marketplace' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Store size={18} /> Dashboard
              </button>
              <button onClick={() => setActiveTab('campaign')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'campaign' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Users size={18} /> Campaña
              </button>
              <button onClick={() => setActiveTab('suppliers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Globe size={18} /> Mis Proveedores
              </button>
              <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 px-4">Búsqueda</div>
              <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Search size={18} /> Catálogo Web
              </button>
              <button onClick={() => setActiveTab('proposal')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'proposal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Edit3 size={18} /> Propuesta Activa
                  {proposalItems.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 rounded-full">{proposalItems.length}</span>}
              </button>
              <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
                  <Database size={18} /> Historial
              </button>
          </nav>
      </div>
  );

  const renderCatalog = () => (
      <div className="flex h-screen overflow-hidden">
          {/* Sidebar de filtros */}
          <div className="w-64 bg-white border-r border-slate-200 p-6 overflow-y-auto flex-shrink-0">
              <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${realSearchMode ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setRealSearchMode(!realSearchMode)}>
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${realSearchMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-xs font-bold text-blue-900">
                          {realSearchMode ? 'Búsqueda REAL (Web)' : 'Búsqueda Local'}
                      </span>
                  </label>
                  <p className="text-[10px] text-blue-600 mt-1 leading-tight">
                      {realSearchMode 
                        ? `Buscando en: ${suppliers[0]?.url.replace('https://www.', '') || 'Web'}`
                        : "Catálogo simulado offline."}
                  </p>
                  {backendUrl && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                          <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                              <Server size={10}/> Backend Propio Activo
                          </span>
                      </div>
                  )}
              </div>

              <h3 className="font-bold text-slate-800 mb-4">Departamentos</h3>
              <div className="space-y-1 mb-8">
                  <button 
                      onClick={() => { setSelectedCategory('Todos'); setRealSearchMode(false); setSearchQuery(''); }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${selectedCategory === 'Todos' && !realSearchMode ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                      Todos los Productos
                  </button>
                  {MOCK_CATEGORIES.map(cat => (
                      <button 
                          key={cat}
                          onClick={() => { 
                              setSelectedCategory(cat); 
                              // Si está activo modo real, al hacer click en categoría disparamos búsqueda
                              if(realSearchMode) {
                                  setSearchQuery(cat);
                                  // El useEffect se encargará de disparar la búsqueda
                              }
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10 gap-4">
                  <div className="flex-1">
                      {realSearchMode ? (
                          <div className="flex gap-2 w-full max-w-xl">
                              <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRealSiteSearch()}
                                    placeholder={`Buscar en ${suppliers[0]?.url.replace('https://', '') || 'web'}...`} 
                                    className="w-full pl-10 pr-4 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                                />
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                              </div>
                              <button 
                                onClick={() => handleRealSiteSearch()}
                                disabled={isAiThinking || !searchQuery}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center gap-2"
                              >
                                {isAiThinking ? <RefreshCw className="animate-spin"/> : <SearchCheck size={18} />}
                                Buscar
                              </button>
                          </div>
                      ) : (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{selectedCategory}</h2>
                            <p className="text-xs text-slate-500">
                                {isLoadingProducts ? "Sincronizando..." : `${products.length} productos disponibles`}
                            </p>
                        </div>
                      )}
                  </div>

                  {campaign.goal && !realSearchMode && (
                    <button 
                      onClick={handleAiCategorySuggest}
                      className="flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      <Sparkles size={16} />
                      IA Sugerir Categoría
                    </button>
                  )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                  {isLoadingProducts ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <RefreshCw className="animate-spin mb-4" size={48} />
                          <p className="text-lg font-medium text-slate-600">
                             {realSearchMode 
                                ? `Buscando "${lastSearchTerm}" en ${suppliers[0]?.name || 'web'}...` 
                                : "Consultando inventario..."}
                          </p>
                          {realSearchMode && !backendUrl && <p className="text-sm mt-2 max-w-md text-center animate-pulse">Usando Google Search Grounding (Modo Lector de Texto).<br/>Las imágenes pueden tardar o ser bloqueadas.</p>}
                      </div>
                  ) : products.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Search size={48} className="mb-4 opacity-50" />
                          <p>No hay resultados. {realSearchMode ? 'Intenta simplificar los términos de búsqueda.' : 'Selecciona una categoría.'}</p>
                       </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => {
                        const isSelected = proposalItems.some(p => p.id === product.id);
                        
                        return (
                            <div key={product.id} className={`group bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-lg ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                            <div className="relative overflow-hidden h-48 bg-slate-100 group-hover:bg-white transition-colors">
                                {/* Carousel maneja el error de imagen si el link es bloqueado por el proveedor */}
                                <Carousel images={product.images} productUrl={product.productUrl} />
                                
                                <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                     <div className="text-[10px] px-2 py-1 rounded backdrop-blur-sm font-bold shadow-sm bg-slate-900 text-white">
                                        {product.supplier}
                                     </div>
                                </div>
                                {product.productUrl && (
                                    <a href={product.productUrl} target="_blank" className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm z-20" title="Ver en web original">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 leading-tight mb-2 line-clamp-2 h-10" title={product.name}>{product.name}</h3>
                                
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">{product.description}</p>

                                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase">Precio Ref.</span>
                                        <span className="font-bold text-base text-slate-900">
                                            {product.price > 0 ? `$${product.price.toLocaleString()}` : 'Consultar'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* Boton Stock */}
                                        <button 
                                            id={`stock-btn-${product.id}`}
                                            onClick={() => handleCheckStock(product.id)}
                                            className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            title="Verificar Stock"
                                        >
                                            {product.stock > 1000 ? '1000+' : 'Stock?'}
                                        </button>

                                        <button 
                                            onClick={() => {
                                                if(isSelected) {
                                                    setProposalItems(prev => prev.filter(p => p.id !== product.id));
                                                } else {
                                                    setProposalItems(prev => [...prev, { ...product, customPrice: product.price }]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${isSelected ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            {isSelected ? 'Quitar' : 'Agregar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                        })}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderMarketplace = () => (
      <div className="p-8 max-w-6xl mx-auto">
          <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Dashboard Proveedores</h2>
              <p className="text-slate-500">Conexiones activas y estado de la red.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Globe size={24} /></div>
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{suppliers.length}</h3>
                  <p className="text-slate-500 text-sm">Webs Conectadas</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Package size={24} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Google AI</h3>
                  <p className="text-slate-500 text-sm">Búsqueda Web Activa</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><LayoutTemplate size={24} /></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{savedProposals.length}</h3>
                  <p className="text-slate-500 text-sm">Propuestas Creadas</p>
              </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Mis Proveedores Activos</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                          <th className="p-4 text-sm font-semibold text-slate-600">Proveedor</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">URL Objetivo</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Estado</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Acciones</th>
                      </tr>
                  </thead>
                  <tbody>
                      {suppliers.map(sup => (
                          <tr key={sup.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                              <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${sup.color.split(' ')[0]}`}></div>
                                  {sup.name}
                              </td>
                              <td className="p-4 text-sm text-slate-500 truncate max-w-[200px]">{sup.url}</td>
                              <td className="p-4">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                      <Wifi size={12} /> Conectado
                                  </span>
                              </td>
                              <td className="p-4">
                                   <button onClick={() => setSuppliers(prev => prev.filter(s => s.id !== sup.id))} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
                  <button onClick={() => setActiveTab('suppliers')} className="text-blue-600 text-sm font-bold hover:underline">Gestionar Lista</button>
              </div>
          </div>
      </div>
  );

  // Render de Vista Cliente (Propuesta tipo Gamma.app)
  const renderClientView = () => (
      <div className="min-h-screen bg-slate-50 font-sans">
          {/* Header de Presentación */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
              <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xl">P</div>
                    <div>
                        <h1 className="font-bold text-slate-800 leading-tight">Propuesta: {campaign.clientName}</h1>
                        <p className="text-xs text-slate-500">Creada especialmente para su marca</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setClientMode(false)} className="text-slate-500 text-sm hover:text-slate-800">Volver a Editor</button>
                    <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 shadow-lg transition-transform hover:scale-105">
                        Aprobar Todo
                    </button>
                 </div>
              </div>
          </div>

          {/* Contenido tipo "Story" */}
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-16">
              {/* Slide Intro */}
              <section className="text-center py-12">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">Objetivo: {campaign.goal}</span>
                  <h2 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">Selección Exclusiva <br/> <span className="text-blue-600">{campaign.theme}</span></h2>
              </section>

              {/* Lista de Productos */}
              {proposalItems.map((item, idx) => (
                  <section key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                      <div className="md:w-1/2 h-96 bg-slate-100 relative p-4 flex items-center justify-center">
                         <Carousel images={item.images} productUrl={item.productUrl} />
                      </div>
                      <div className="md:w-1/2 p-8 flex flex-col justify-between relative">
                          <div>
                             <h3 className="text-2xl font-bold text-slate-800 mb-2">{item.name}</h3>
                             <p className="text-slate-600 leading-relaxed mb-6">
                                 {item.aiComment || item.description}
                             </p>
                             
                             <div className="flex flex-wrap gap-2 mb-6">
                                {item.colors.map(c => (
                                    <span key={c} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">{c}</span>
                                ))}
                             </div>
                          </div>

                          <div className="pt-6 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-4">
                                  <span className="text-3xl font-bold text-slate-900">
                                      ${(item.customPrice || 0).toFixed(2)}
                                  </span>
                              </div>
                              <textarea 
                                placeholder="¿Algún comentario sobre este item?"
                                className="w-full text-sm bg-slate-50 border-slate-200 rounded p-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                rows={2}
                              ></textarea>
                          </div>
                      </div>
                  </section>
              ))}
          </div>
      </div>
  );

  if (clientMode) {
      return renderClientView();
  }

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans text-slate-800">
      {renderSidebar()}

      <main className="flex-1 h-screen overflow-y-auto relative">
        
        {/* Contenido Principal Dinámico */}
        {activeTab === 'marketplace' && renderMarketplace()}

        {activeTab === 'catalog' && renderCatalog()}

        {activeTab === 'campaign' && (
           <div className="p-10 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-slate-800">Configuración de Campaña</h2>
              <div className="bg-white p-8 rounded-xl shadow-sm space-y-6 border border-slate-200">
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Cliente</label>
                          <input value={campaign.clientName} onChange={e => setCampaign({...campaign, clientName: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Coca Cola" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Presupuesto</label>
                          <input value={campaign.budget} onChange={e => setCampaign({...campaign, budget: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: $5,000 USD" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Objetivo Principal</label>
                      <textarea value={campaign.goal} onChange={e => setCampaign({...campaign, goal: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Ej: Regalos para convención anual de ventas enfocados en tecnología..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Audiencia</label>
                          <input value={campaign.audience} onChange={e => setCampaign({...campaign, audience: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Ejecutivos 30-45 años" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Tema / Vibe</label>
                          <input value={campaign.theme} onChange={e => setCampaign({...campaign, theme: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Innovación, Eco-friendly, Premium" />
                      </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                      <button onClick={() => { handleAiCategorySuggest(); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200">
                          <Sparkles size={18} /> Guardar e Iniciar
                      </button>
                  </div>
              </div>
           </div>
        )}

        {activeTab === 'proposal' && (
            <div className="flex h-screen">
                <div className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Editor de Propuesta</h2>
                        <div className="flex gap-2">
                            <button onClick={saveProposal} className="text-slate-500 hover:text-blue-600 p-2"><Download size={20}/></button>
                            <button onClick={() => setClientMode(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2">
                                <ExternalLink size={16} /> Vista Cliente
                            </button>
                        </div>
                    </div>
                    
                    {proposalItems.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50"/>
                            <p>Agrega productos del catálogo para comenzar.</p>
                            <button onClick={() => setActiveTab('catalog')} className="mt-4 text-blue-600 font-bold hover:underline">Ir al Catálogo</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {proposalItems.map((item, idx) => (
                                <div key={item.id} className="border border-slate-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow relative">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            <Carousel images={item.images} productUrl={item.productUrl} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold text-slate-800">{item.name}</h3>
                                                <button onClick={() => setProposalItems(prev => prev.filter(p => p.id !== item.id))} className="text-slate-300 hover:text-red-500"><X size={16}/></button>
                                            </div>
                                            <div className="mt-2">
                                                <textarea 
                                                    className="w-full text-sm text-slate-600 bg-slate-50 p-2 rounded border border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white outline-none transition-all"
                                                    rows={3}
                                                    value={item.aiComment || item.description}
                                                    onChange={(e) => setProposalItems(prev => prev.map(p => p.id === item.id ? {...p, aiComment: e.target.value} : p))}
                                                />
                                                <button 
                                                    onClick={() => handleAiRewrite(item)}
                                                    disabled={isAiThinking}
                                                    className="mt-1 text-xs text-purple-600 font-bold flex items-center gap-1 hover:underline"
                                                >
                                                    <Sparkles size={12} /> {isAiThinking ? 'Mejorando...' : 'Mejorar con IA'}
                                                </button>
                                            </div>
                                            <div className="mt-3 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">Tu Precio:</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-24 text-sm font-bold text-slate-800 border border-slate-200 rounded px-2 py-1"
                                                        placeholder="0.00"
                                                        value={item.customPrice || ''}
                                                        onChange={(e) => setProposalItems(prev => prev.map(p => p.id === item.id ? {...p, customPrice: Number(e.target.value)} : p))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-1/2 bg-slate-100 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <LayoutTemplate size={64} className="text-slate-300 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-slate-400">Vista Previa</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">Usa el botón "Vista Cliente" para ver la experiencia final tipo Gamma.app</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'suppliers' && (
            <div className="p-10 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Gestión de Proveedores</h2>
                        <p className="text-slate-500">Conecta URLs externas para búsqueda específica.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowBackendScript(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2">
                            <Code size={18} /> Generar Script Backend
                        </button>
                        <button onClick={() => setShowAddSupplierModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                            <Plus size={18} /> Nuevo Proveedor
                        </button>
                    </div>
                </div>
                
                {/* Panel de Configuración de Backend Existente */}
                <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Server size={16} className="text-slate-500"/> Conexión a Servidor Propio (Opcional)
                    </h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="https://mi-backend-scraping.onrender.com" 
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                        />
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">
                            Guardar URL
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Si dejas esto vacío, el sistema usará <strong>Google AI (Search Grounding)</strong> para buscar productos (limitado). Si pones tu servidor, usará scraping real.
                    </p>
                </div>

                <div className="grid gap-4">
                    {suppliers.map(sup => (
                        <div key={sup.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm ${sup.color}`}>
                                    {sup.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{sup.name}</h3>
                                    <a href={sup.url} target="_blank" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
                                        {sup.url} <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Estado</div>
                                    <div className="text-sm font-bold text-green-600 flex items-center justify-end gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Listo
                                    </div>
                                </div>
                                <button onClick={() => setSuppliers(prev => prev.filter(s => s.id !== sup.id))} className="text-slate-400 hover:text-red-500 p-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Modal Agregar Proveedor */}
        {showAddSupplierModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Conectar Nuevo Proveedor</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">URL del Sitio Web</label>
                            <input 
                                autoFocus
                                placeholder="https://www.catalogospromocionales.com"
                                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newSupplierData.url}
                                onChange={e => setNewSupplierData({...newSupplierData, url: e.target.value})}
                            />
                        </div>
                        <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
                            Se usará Google Search Grounding para buscar productos "site-specific" dentro de este dominio.
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setShowAddSupplierModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleAddSupplier} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Modal Generador de Script Backend */}
        {showBackendScript && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-700">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Code size={20}/> Tu Backend Privado</h3>
                        <button onClick={() => setShowBackendScript(false)} className="hover:bg-slate-700 p-1 rounded-full"><X /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        <div className="mb-6">
                            <h4 className="font-bold text-slate-800 mb-2">¿Para qué sirve esto?</h4>
                            <p className="text-sm text-slate-600">
                                Este código permite crear un servidor que "descarga" las imágenes y datos reales de tus proveedores. 
                                Súbelo a un hosting gratuito y pega la URL en la pestaña "Mis Proveedores".
                            </p>
                        </div>

                        <div className="relative">
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700">
                                {getBackendScript()}
                            </pre>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(getBackendScript());
                                    alert("Código copiado al portapapeles");
                                }}
                                className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-2 text-xs font-bold"
                            >
                                <Copy size={14} /> Copiar Código
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
