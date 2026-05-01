import React, { useState, useEffect, useRef } from 'react'
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import BrandLogo from '../assets/branding-logo.png'
import PackageLogo from '../assets/package-logo.png'
import DesignLogo from '../assets/design-logo.png'
import { supabase } from '../config/supabaseConfig'
import ImageSuspense from '../components/imageSuspense';
import { toast, Toaster } from 'sonner';

const ProjectCard = ({ project, onSelect, isIdle, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.description || 'Cassy Graphix Portfolio',
          text: `Check out this design: ${project.description}`,
          url: project.image,
        });
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(project.image);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div 
      className={`group transition-all duration-300 cursor-pointer flex flex-col h-full rounded-2xl ${isIdle ? 'bg-transparent border-transparent shadow-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl'}`}
      onClick={() => onSelect(project)}
    >
      <div 
        className={`aspect-[4/3] bg-slate-200 dark:bg-slate-700 relative overflow-hidden rounded-2xl ${isIdle ? 'animate-3d-pop' : ''}`}
        style={isIdle ? { animationDelay: `${index * 0.15}s` } : {}}
      >
        {!imageLoaded && <ImageSuspense className="absolute inset-0 w-full h-full z-20" />}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors duration-300 z-10" />
        <img 
          src={project.image} 
          alt={project.title} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${imageLoaded ? 'group-hover:scale-110' : 'hidden'}`}
        />
        <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
           <button 
             onClick={handleShare}
             className="bg-white text-indigo-600 p-3 rounded-full shadow-lg inline-flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer"
             title="Share"
           >
             <i className="fa-solid fa-share-nodes"></i>
           </button>
           <span className="bg-white text-indigo-600 p-3 rounded-full shadow-lg inline-flex items-center justify-center cursor-pointer">
             <i className="fa-solid fa-expand"></i>
           </span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold group-hover:text-indigo-600 dark:text-white transition-colors">{project.description}</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">{project.category}</p>
      </div>
    </div>
  );
};

const ModalImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden rounded-lg min-h-[300px]">
      {!loaded && <ImageSuspense className="absolute inset-0 w-full h-full z-10" />}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        className={`max-w-full max-h-[80vh] object-contain shadow-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

const RevealOnScroll = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
};

function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 5000);
    };

    const handleParallax = (e) => {
      resetTimer();
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };

    window.addEventListener('mousemove', handleParallax);
    const otherEvents = ['keydown', 'mousedown', 'touchstart', 'scroll'];
    otherEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', handleParallax);
      otherEvents.forEach(event => window.removeEventListener(event, resetTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) console.error('Error fetching projects:', error)
      else setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const projectImages = React.useMemo(() => {
    if (!selectedProject) return [];
    let imgs = selectedProject.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { console.error(e); }
    }
    return Array.isArray(imgs) && imgs.length > 0 ? imgs : [selectedProject.image];
  }, [selectedProject]);

  const currentProjectIndex = selectedProject ? projects.findIndex(p => p.id === selectedProject.id) : -1;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop3d {
          0%, 100% { 
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          50% { 
            transform: perspective(1000px) rotateX(4deg) rotateY(-4deg) scale(1.05) translateZ(30px);
            box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.3);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-3d-pop {
          animation: pop3d 3s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
      {/* Navbar */}

        <NavBar/>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-hidden">
        <div 
          className="flex-1 space-y-6"
          style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
        >
          <RevealOnScroll>
            <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold mb-2">
              Available for freelance
              <Link to="/admin" className="hover:text-indigo-700 transition-colors">
                <i className="fa-solid fa-briefcase ms-2 text-[10px] opacity-70"></i>
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll className="delay-100">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Designing <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Digital Experiences
              </span>
            </h1>
          </RevealOnScroll>
          <RevealOnScroll className="delay-200">
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              I'm a graphic designer and UI specialist focused on creating clean, functional, and aesthetic designs for forward-thinking brands.
            </p>
          </RevealOnScroll>
          <RevealOnScroll className="delay-300">
            <div className="flex gap-4 pt-4">
              <a href="#work" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                View Work
              </a>
              <a href="#contact" className="px-8 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:border-slate-400 transition-all">
                Contact Me
              </a>
            </div>
          </RevealOnScroll>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-gradient-to-tr from-indigo-100 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center relative z-10 animate-float">
             {/* Abstract shapes representing design */}
             <div 
               className="w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl absolute border border-slate-50 dark:border-slate-700 transition-transform duration-75 ease-out"
               style={{ transform: `rotate(12deg) translate(${mousePos.x}px, ${mousePos.y}px)` }}
             ></div>
             <div 
               className="w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-indigo-600 shadow-2xl rounded-2xl absolute opacity-90 transition-transform duration-100 ease-out"
               style={{ transform: `rotate(-6deg) translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)` }}
             ></div>
          </div>
          <div 
            className="absolute top-1/2 left-1/2 w-[350px] h-[350px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] bg-indigo-300/20 blur-3xl rounded-full -z-0 animate-pulse transition-transform duration-150 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x * 0.5}px), calc(-50% + ${mousePos.y * 0.5}px))` }}
          ></div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section id="work" className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 dark:text-white">Featured Projects</h2>
              <p className="text-slate-500">A selection of my recent work.</p>
            </div>
            <Link to="all-projects" className="hidden md:block text-indigo-600 font-medium hover:underline">View all projects <i className='fa-solid fa-arrow-right'></i></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden">
                    <ImageSuspense className="w-full h-full" />
                  </div>
                ))
              : projects.map((project, index) => (
                  <RevealOnScroll key={project.id}>
                    <ProjectCard 
                      project={project} 
                      isIdle={isIdle}
                      index={index}
                      onSelect={(p) => { setSelectedProject(p); setCurrentImageIndex(0); }} 
                    />
                  </RevealOnScroll>
                ))
            }
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link to="/all-projects" className="text-indigo-600 font-medium hover:underline">View all projects <i className='fa-solid fa-arrow-right'></i></Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">My Expertise</h2>
          <p className="text-slate-600 dark:text-slate-400">I help companies build strong brands and digital products through strategic design.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RevealOnScroll>
            <div className="group p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/50 dark:hover:bg-slate-900/50 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img src={BrandLogo} alt="brand logo" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Brand Identity</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Logo design, color palettes, typography, and comprehensive brand guidelines to help your business stand out.
            </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="group p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/50 dark:hover:bg-slate-900/50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img src={DesignLogo} alt="design logo" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Motion Design</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Responsive, user-friendly motion designs that look great on all devices and convert visitors into customers.
            </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="group p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/50 dark:hover:bg-slate-900/50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img src={PackageLogo} alt="package logo" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Packaging</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Eye-catching posters, flyers, and other design that tells your product's story and grabs attention on the shelf.
            </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer / Contact */}
        <Footer/>

      {/* Image Slider Modal */}
       {selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedProject(null)}>
          <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-transparent" onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute -top-6 right-0 z-50 text-white/70 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            
            >
              <span className="text-sm font-medium uppercase tracking-widest">Close</span>
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            {/* Image Component with unique key to naturally reset loading state */}
            <ModalImage 
              key={projectImages[currentImageIndex]}
              src={projectImages[currentImageIndex]} 
              alt={selectedProject.title} 
            />

            {/* Caption / Info */}
            <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-bold">{selectedProject.description}</h3>
                {projectImages.length > 1 && (
                  <p className="text-white/60 text-sm mt-1">{currentImageIndex + 1} / {projectImages.length}</p>
                )}
            </div>

             {/* Navigation buttons */}
             {projectImages.length > 1 && (
               <>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setCurrentImageIndex((prev) => (prev === 0 ? projectImages.length - 1 : prev - 1));
                   }}
                   className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-r-lg cursor-pointer"
                 >
                   <i className="fa-solid fa-chevron-left text-3xl"></i>
                 </button>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);
                   }}
                   className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-l-lg cursor-pointer"
                 >
                  <i className="fa-solid fa-chevron-right text-3xl"></i>
                 </button>
               </>
             )}

             {/* Project Navigation */}
             <div className="flex justify-between items-center w-full mt-8 px-2">
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   if (currentProjectIndex > 0) {
                     setSelectedProject(projects[currentProjectIndex - 1]);
                     setCurrentImageIndex(0);
                   }
                 }}
                 className={`cursor-pointer text-white/70 hover:text-white flex items-center gap-2 transition-colors ${currentProjectIndex <= 0 ? 'opacity-0 pointer-events-none' : ''}`}
               >
                 <i className="fa-solid fa-arrow-left"></i> Previous Project
               </button>
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   if (currentProjectIndex < projects.length - 1) {
                     setSelectedProject(projects[currentProjectIndex + 1]);
                     setCurrentImageIndex(0);
                   }
                 }}
                 className={` cursor-pointer text-white/70 hover:text-white flex items-center gap-2 transition-colors ${currentProjectIndex >= projects.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
               >
                 Next Project <i className="fa-solid fa-arrow-right"></i>
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
