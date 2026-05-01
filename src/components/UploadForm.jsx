import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'
import { Toaster, toast } from 'sonner'
import imageCompression from 'browser-image-compression'

function UploadForm() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Branding')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const categories = ['Branding', 'Poster', 'Flyer', 'UI/UX',];
  const BUCKET_NAME = 'portfolio_image';
  const RECENT_DURATION_MS = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    const fetchProjects = async () => {
      // Get ISO timestamp for 1 hour ago
      const oneHourAgo = new Date(Date.now() - RECENT_DURATION_MS).toISOString();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .gt('created_at', oneHourAgo); // Only fetch projects newer than 1 hour

      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data)
      }
    }
    fetchProjects()

    // Cleanup timer: check every minute to remove projects that have become > 1hr old
    const interval = setInterval(() => {
      setProjects(prev => prev.filter(p => {
        const projectTime = new Date(p.created_at).getTime();
        return (Date.now() - projectTime) < RECENT_DURATION_MS;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [])

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0]
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      }

      const compressionToast = toast.loading('Optimizing image...')
      try {
        const compressedBlob = await imageCompression(originalFile, options)
        
        // Convert blob to file with webp extension
        const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + ".webp"
        const compressedFile = new File([compressedBlob], fileName, { type: 'image/webp' })

        // Clean up the previous object URL to prevent memory leaks
        if (preview) {
          URL.revokeObjectURL(preview)
        }

        setFile(compressedFile)
        setPreview(URL.createObjectURL(compressedFile))
        toast.success('Image optimized successfully', { id: compressionToast })
      } catch (error) {
        console.error('Compression error:', error)
        toast.error('Failed to process image', { id: compressionToast })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)

      // 3. Insert record into database
      const { data: insertedData, error: dbError } = await supabase
        .from('projects')
        .insert([
          {
            description: description,
            category,
            image: publicUrl,
            images: [publicUrl]
          }
        ])
        .select()

      if (dbError) throw dbError

      toast.success('Project uploaded successfully!')

      const newProject = {
        id: insertedData[0].id,
        description,
        category,
        image: publicUrl,
        name: file.name,
        created_at: insertedData[0].created_at
      }
      setProjects([newProject, ...projects])
      setDescription('')
      setCategory('Branding')
      setFile(null)
      
      // Clean up object URL after successful upload
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      setPreview(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

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

  const executeDelete = async () => {
    const id = deleteTarget
    const idsToDelete = id ? [id] : Array.from(selectedIds)
    
    setShowDeleteConfirm(false)

    setUploading(true)
    try {
      console.log('Deleting project IDs:', idsToDelete)
      
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .in('id', idsToDelete)

      if (dbError) throw dbError

      const toRemove = projects.filter(p => idsToDelete.includes(p.id))
      const files = toRemove
        .filter(p => p.image) // Ensure image URL exists
        .map(p => p.image.split('/').pop())
      
      if (files.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(files)
        
        if (storageError) console.error('Storage delete error:', storageError)
      }

      setProjects(prev => prev.filter(p => !idsToDelete.includes(p.id)))
      
      if (id) {
        const newSelection = new Set(selectedIds)
        newSelection.delete(id)
        setSelectedIds(newSelection)
      } else {
        setSelectedIds(new Set())
      }
      
      toast.success('Deleted successfully')
    } catch (error) {
      console.error('Delete operation failed:', error)
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
      <Toaster position="top-center" richColors />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Upload New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white border p-3 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Enter project description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white border p-3 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project Image
          </label>
          {preview && (
            <div className="mb-4 relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <img src={preview} alt="Preview" className="w-full h-64 object-contain" />
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  if (preview) {
                    URL.revokeObjectURL(preview)
                  }
                  setPreview(null)
                }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative group">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
          {file && (
            <div className="mt-2 flex items-center text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {file.name}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Project'}
        </button>
      </form>

      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Recent Uploads (Last 1hr)</h3>
          {projects.length > 0 && (
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={toggleAll}
                className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
              >
                {selectedIds.size === projects.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.size > 0 && (
                <button 
                  type="button"
                  onClick={() => handleDelete()}
                  className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Delete ({selectedIds.size})
                </button>
              )}
            </div>
          )}
        </div>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No projects uploaded yet.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${selectedIds.has(project.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(project.id)}
                    onChange={() => toggleSelection(project.id)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={project.image} alt="Project" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">{project.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600">{project.category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(project.created_at || Date.now()).toLocaleDateString()} • {new Date(project.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-center"
                  title="Delete Project"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

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

export default UploadForm