import React, { useState, useRef } from 'react';
import { usePortalStore } from '../services/store';
import { MessageAttachment } from '../types';
import { MessageSquare, Paperclip, Send, Users } from 'lucide-react';

export const MessagesView: React.FC = () => {
  const store = usePortalStore();
  const [selectedConvId, setSelectedConvId] = useState<string>(store.conversations?.[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: MessageAttachment[] = Array.from(files).map(file => ({
        id: `att-${Date.now()}-${file.name}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: 'file',
        url: URL.createObjectURL(file)
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const conversation = store.conversations?.find(c => c.id === selectedConvId);
  const messages = store.messages?.filter(m => m.conversationId === selectedConvId) || [];

  const handleSendMessage = () => {
    if ((!messageText.trim() && attachments.length === 0) || !conversation) return;
    store.actions.sendMessage({
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: store.currentUser.id,
      senderName: store.currentUser.name,
      senderAvatar: store.currentUser.avatar,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? attachments : undefined
    });
    setMessageText('');
    setAttachments([]);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="w-1/3 border-r border-slate-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">People</h2>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
            <Users size={16} /> New Group
          </button>
        </div>
        {store.staff.map(person => (
          <div 
            key={person.id}
            onClick={() => {
              // Find or create direct conversation
              const existingConv = store.conversations.find(c => c.type === 'direct' && c.participantIds.includes(person.id) && c.participantIds.includes(store.currentUser.id));
              if (existingConv) {
                setSelectedConvId(existingConv.id);
              } else {
                // In a real app, we'd trigger a create action here. For now, just select the person (placeholder).
                console.log(`Open DM with ${person.name}`);
              }
            }}
            className="p-3 rounded-lg cursor-pointer mb-2 hover:bg-slate-50 flex items-center gap-3"
          >
            <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-medium text-slate-900">{person.name}</div>
              <div className="text-xs text-slate-500">{person.role}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="w-2/3 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          <h3 className="font-semibold text-slate-800 mb-4">{conversation?.name}</h3>
          {messages.map(msg => (
            <div key={msg.id} className={`mb-4 ${msg.senderId === store.currentUser.id ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${msg.senderId === store.currentUser.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                <div>{msg.text}</div>
                {msg.attachments && msg.attachments.map(att => (
                  <div key={att.id} className="mt-2 text-xs bg-white/20 p-2 rounded flex items-center gap-2">
                    <Paperclip size={12} />
                    {att.name} ({att.size})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 mb-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-600">{att.name}</span>
              <button className="text-rose-500 hover:text-rose-700" onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}>Remove</button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-indigo-600">
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 p-2 border border-slate-300 rounded-lg"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
