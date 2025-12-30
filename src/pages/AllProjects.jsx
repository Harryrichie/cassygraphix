import React, { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar';
import { supabase } from '../config/supabaseConfig'

function AllProjects() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Branding', 'UI/UX', 'Marketing', 'Packaging', 'Print'];

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching projects:', error)
      else setAllProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filteredProjects = selectedCategory === 'All' 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory);

  const currentProjectIndex = selectedProject ? filteredProjects.findIndex(p => p.id === selectedProject.id) : -1;

  const projectImages = React.useMemo(() => {
    if (!selectedProject) return [];
    let imgs = selectedProject.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { console.error(e); }
    }
    return Array.isArray(imgs) && imgs.length > 0 ? imgs : [selectedProject.image];
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Simple Header */}
      
        <header>
          <NavBar/>
        </header>

      {/* Main Content */}

      <main className="max-w-7xl mx-auto mt-8 px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">My Portfolio</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            A curated selection of my best work. I believe in creating designs that are not just visually appealing but also strategically effective.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col h-full"
              onClick={() => { setSelectedProject(project); setCurrentImageIndex(0); }}
            >
              <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                   <span className="bg-white text-indigo-600 p-3 rounded-full shadow-lg inline-flex items-center justify-center">
                     <i className="fa-solid fa-expand"></i>
                   </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{project.description}</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{project.category}</p>
              </div>
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No projects found in this category.</p>
            </div>
        )}
      </main>

      <Footer />

      {/* Modal */}
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

            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden rounded-lg">
              <img 
                src={projectImages[currentImageIndex]} 
                alt={selectedProject.title} 
                className="max-w-full max-h-[80vh] object-contain shadow-2xl"
              />
            </div>

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
                     setSelectedProject(filteredProjects[currentProjectIndex - 1]);
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
                   if (currentProjectIndex < filteredProjects.length - 1) {
                     setSelectedProject(filteredProjects[currentProjectIndex + 1]);
                     setCurrentImageIndex(0);
                   }
                 }}
                 className={` cursor-pointer text-white/70 hover:text-white flex items-center gap-2 transition-colors ${currentProjectIndex >= filteredProjects.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
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

export default AllProjects
