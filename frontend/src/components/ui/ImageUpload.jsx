import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

export function ImageUpload({ value, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert('Please upload a valid image (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const removeImage = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
        <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-500">Click or drag image here</p>
      <p className="text-xs text-gray-400">JPEG, PNG, WebP - max 2MB</p>
    </div>
  );
}