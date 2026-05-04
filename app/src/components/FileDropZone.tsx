import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  accept: string
  label: string
  onFile: (file: File) => void
}

export function FileDropZone({ accept, label, onFile }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  return (
    <div
      className={`dropzone${dragging ? ' dragging' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Upload size={32} strokeWidth={1.5} />
      <p className="dropzone-label">{label}</p>
      <p className="dropzone-hint">Clique ou arraste o ficheiro aqui</p>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} hidden />
    </div>
  )
}
