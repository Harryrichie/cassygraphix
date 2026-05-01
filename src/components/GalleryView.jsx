import React from 'react'
import{supabase} from '../config/supabaseConfig'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'sonner'

function GalleryView() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [loading, setLoading] = useState(true)

    const toggleSelection = (id) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)))
    }
  }

  const handleDelete = (id = null) => {
    const idsToDelete = id ? [id] : Array.from(selectedIds)
    if (idsToDelete.length === 0) return
    setDeleteTarget(id)
    setShowDeleteConfirm(true)
  }

  const handleShare = async (e, project) => {
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

  const executeDelete = async () => {
    const id = deleteTarget
    const idsToDelete = id ? [id] : Array.from(selectedIds)
    
    setShowDeleteConfirm(false)
    
    const toastId = toast.loading('Deleting projects...')
    try {
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .in('id', idsToDelete)

      if (dbError) throw dbError

      const toRemove = projects.filter(p => idsToDelete.includes(p.id))
      const files = toRemove
        .filter(p => p.image)
        .map(p => p.image.split('/').pop())
      
      if (files.length > 0) {
        await supabase.storage
          .from('portfolio_image')
          .remove(files)
      }

      setProjects(prev => prev.filter(p => !idsToDelete.includes(p.id)))
      setSelectedIds(new Set())
      toast.success('Projects deleted successfully', { id: toastId })
    } catch (error) {
      console.error('Delete operation failed:', error)
      toast.error('Failed to delete projects', { id: toastId })
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        toast.error('Could not load gallery')
      } else {
        setProjects(data)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Gallery</h1>
            <p className="text-sm text-slate-500">{projects.length} total projects</p>
          </div>
        </div>
        
        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleAll}
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer"
            >
              {selectedIds.size === projects.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md bg-slate-900 dark:bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in-up">
          <span className="font-medium">{selectedIds.size} projects selected</span>
          <button 
            onClick={() => handleDelete()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <i className="fa-solid fa-images text-5xl text-slate-300 mb-4"></i>
          <p className="text-slate-500 dark:text-slate-400 text-lg">No projects uploaded yet.</p>
          <button onClick={() => navigate('/admin')} className="mt-4 text-indigo-600 font-medium hover:underline cursor-pointer">Go upload some work</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedIds.has(project.id) ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-20">
                <input 
                  type="checkbox"
                  checked={selectedIds.has(project.id)}
                  onChange={() => toggleSelection(project.id)}
                  className="w-6 h-6 rounded-lg border-white/50 text-indigo-600 focus:ring-indigo-500 cursor-pointer backdrop-blur-md"
                />
              </div>

              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={project.image} alt={project.description} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => handleShare(e, project)}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-indigo-600 rounded-xl cursor-pointer shadow-sm transition-colors"
                    title="Share"
                  >
                    <i className="fa-solid fa-share-nodes"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-500 rounded-xl cursor-pointer shadow-sm transition-colors"
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              {/* Info Overlay / Footer */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold truncate text-sm">{project.description}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete {deleteTarget ? 'this project' : `${selectedIds.size} projects`}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryView
