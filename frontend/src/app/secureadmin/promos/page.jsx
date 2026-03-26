'use client';
import { useState } from 'react';

export default function PromosPage() {
  const [driveLink, setDriveLink] = useState('');
  const [savedLinks, setSavedLinks] = useState([]);

  function addLink() {
    if (!driveLink) return;
    setSavedLinks([...savedLinks, { url: driveLink, added: new Date().toLocaleString() }]);
    setDriveLink('');
  }

  function removeLink(index) {
    setSavedLinks(savedLinks.filter((_, i) => i !== index));
  }

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Promotional Assets</h1>
      <p className="text-sm text-gray-500 mb-6">Manage Google Drive links and promotional materials.</p>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">📁 Google Drive Sync</h3>
        <p className="text-xs text-blue-600 mb-4">Add Google Drive folder links to organize your promotional assets. Files can be referenced directly from these drives.</p>
        <div className="flex gap-2">
          <input value={driveLink} onChange={e => setDriveLink(e.target.value)} placeholder="Paste Google Drive folder URL..." className="flex-1 px-4 py-3 border border-blue-200 rounded-xl text-sm bg-white" />
          <button onClick={addLink} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition">+ Add Link</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">📋 Saved Drive Links</h3>
        {savedLinks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No promotional asset links saved yet.</p>
        ) : (
          <div className="space-y-2">
            {savedLinks.map((link, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 font-medium hover:underline truncate block max-w-lg">{link.url}</a>
                  <p className="text-[10px] text-gray-400">Added: {link.added}</p>
                </div>
                <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">📸 Quick Assets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Banner Templates', 'Product Photos', 'Social Media Kit', 'Brand Guidelines'].map(item => (
            <div key={item} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:border-primary-200 hover:shadow-sm transition cursor-pointer">
              <span className="text-3xl block mb-2">📁</span>
              <p className="text-xs font-bold text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
