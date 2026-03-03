'use client';

import { useState, useEffect } from 'react';
import { mockChats, mockMessages, type Chat, type Message, type Project as ProjectType } from '../lib/mockData';
import { MessageSquare, Users, Send, Paperclip, Image, FileText, Briefcase, DollarSign, ArrowLeft, X, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import BottomNav from '@/app/components/BottomNav';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuthStore } from '../lib/auth-store';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    price: '',
    duration_days: '',
    notes: '',
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showOffersList, setShowOffersList] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
    loadOffers();
  }, []);

  const loadProjects = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load projects:', res.status);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadOffers = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/offers`);
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load offers:', res.status);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffers([]);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(mockMessages[chat.id] || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: `m${Date.now()}`,
      chatId: selectedChat.id,
      senderId: 'me',
      senderName: 'أنا',
      type: 'text',
      content: newMessage,
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Send to API in background
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          senderId: user?.id || 1,
          content: newMessage,
          messageType: 'text',
        }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAcceptOffer = async (offer: any) => {
    const confirmed = confirm(
      `هل تريد قبول هذا العرض؟\\n\\n` +
      `💼 الخدمة: ${offer.service}\\n` +
      `💰 السعر: ${offer.price}${offer.currency}\\n` +
      `⏰ المدة: ${offer.duration}\\n\\n` +
      `سيتم حجز المبلغ في Escrow وإطلاقه عند التسليم.`
    );

    if (!confirmed) return;

    try {
      // إنشاء Escrow وحجز المبلغ
      const escrowResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({
          action: 'create',
          sellerId: 2, // TODO: Get actual seller ID
          amount: offer.price,
          relatedType: 'offer',
          relatedId: offer.id
        })
      });

      if (!escrowResponse.ok) {
        const error = await escrowResponse.json();
        alert(error.error || 'فشل في حجز المبلغ. تأكد من رصيدك المتاح.');
        return;
      }

      // تحديث حالة العرض في الرسالة
      const updatedMessages = messages.map(msg => {
        if (msg.type === 'price_offer' && msg.priceOffer?.id === offer.id) {
          return {
            ...msg,
            priceOffer: {
              ...msg.priceOffer,
              status: 'accepted' as const
            }
          } as Message;
        }
        return msg;
      });

      setMessages(updatedMessages);
      alert('✅ تم قبول العرض وحجز المبلغ في Escrow بنجاح!');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('حدث خطأ أثناء قبول العرض');
    }
  };

  const handleNegotiate = (offerId: string) => {
    alert('بدء التفاوض...');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    setUploadingFile(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();

        // Create message
        const message: Message = {
          id: `m${Date.now()}`,
          chatId: selectedChat!.id,
          senderId: 'me',
          senderName: 'أنا',
          type: isImage ? 'image' : 'file',
          content: url,
          imageUrl: isImage ? url : undefined,
          timestamp: new Date(),
          read: false,
        };

        setMessages([...messages, message]);

        // Send to API
        await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: selectedChat!.id,
            senderId: user?.id || 1,
            content: url,
            messageType: isImage ? 'image' : 'file',
            fileName: file.name,
            fileSize: file.size,
          }),
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('فشل رفع الملف');
    } finally {
      setUploadingFile(false);
      setShowAttachMenu(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!offerForm.title || !offerForm.description || !offerForm.price || !offerForm.duration_days) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      // Create offer in database
      const offerRes = await fetch(`${apiUrl}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 1,
          title: offerForm.title,
          description: offerForm.description,
          price: parseFloat(offerForm.price),
          category: 'خدمات',
          status: 'active',
        }),
      });

      if (offerRes.ok) {
        const newOffer = await offerRes.json();

        // Create offer message
        const offerMessage: Message = {
          id: `m${Date.now()}`,
          chatId: selectedChat!.id,
          senderId: 'me',
          senderName: 'أنا',
          type: 'price_offer',
          content: '',
          timestamp: new Date(),
          read: false,
          priceOffer: {
            id: newOffer.id.toString(),
            service: offerForm.title,
            price: parseFloat(offerForm.price),
            currency: '$',
            duration: `${offerForm.duration_days} أيام`,
            status: 'pending',
          },
        };

        setMessages([...messages, offerMessage]);

        // Send message to API
        await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: selectedChat!.id,
            senderId: user?.id || 1,
            messageType: 'offer',
            relatedId: newOffer.id,
          }),
        });

        setShowOfferModal(false);
        setOfferForm({
          title: '',
          description: '',
          price: '',
          duration_days: '',
          notes: '',
        });

        alert('تم إرسال عرض السعر بنجاح! 🎉');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('فشل إنشاء العرض');
    }
  };

  const handleSendProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      alert('لم يتم العثور على المشروع');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const projectMessage: Message = {
        id: `m${Date.now()}`,
        chatId: selectedChat!.id,
        senderId: 'me',
        senderName: 'أنا',
        type: 'project',
        content: '',
        timestamp: new Date(),
        read: false,
        project: {
          id: project.id.toString(),
          title: project.title,
          budget: project.budget_min || project.budget_max || 0,
          currency: '$',
          deadline: project.deadline ? new Date(project.deadline).toLocaleDateString('ar-SA') : 'غير محدد',
        },
      };

      setMessages([...messages, projectMessage]);

      // Send to API
      await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat!.id,
          senderId: user?.id || 1,
          messageType: 'project',
          relatedId: projectId,
        }),
      });

      setShowProjectModal(false);
    } catch (error) {
      console.error('Error sending project:', error);
      alert('حدث خطأ أثناء إرسال المشروع');
    }
  };

  const handleSendOffer = async (offerId: number) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const offerMessage: Message = {
      id: `m${Date.now()}`,
      chatId: selectedChat!.id,
      senderId: 'me',
      senderName: 'أنا',
      type: 'price_offer',
      content: '',
      timestamp: new Date(),
      read: false,
      priceOffer: {
        id: offer.id.toString(),
        service: offer.title,
        price: offer.price,
        currency: '$',
        duration: '10 أيام',
        status: 'pending',
      },
    };

    setMessages([...messages, offerMessage]);

    // Send to API
    try {
      await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat!.id,
          senderId: user?.id || 1,
          messageType: 'offer',
          relatedId: offerId,
        }),
      });
    } catch (error) {
      console.error('Error sending offer:', error);
    }

    setShowOffersList(false);
  };

  if (!selectedChat) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-lg mx-auto bg-white min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                الدردشات
              </h1>
            </div>

            {/* Chat List */}
            <div className="divide-y">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                        {chat.avatar}
                      </div>
                      {chat.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true, locale: ar })}
                          </span>
                        )}
                      </div>
                      
                      {chat.lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage.type === 'text' && chat.lastMessage.content}
                            {chat.lastMessage.type === 'image' && '📷 صورة'}
                            {chat.lastMessage.type === 'file' && '📎 ملف'}
                            {chat.lastMessage.type === 'price_offer' && '💼 عرض سعر'}
                            {chat.lastMessage.type === 'project' && '🎯 مشروع'}
                            {chat.lastMessage.type === 'job' && '💼 وظيفة'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <div className="max-w-lg mx-auto bg-white min-h-screen w-full flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedChat(null)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                {selectedChat.avatar}
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{selectedChat.name}</h2>
                {selectedChat.type === 'individual' && (
                  <p className="text-xs text-blue-100">
                    {selectedChat.participants[0].status === 'online' ? 'متصل الآن' : 'غير متصل'}
                  </p>
                )}
                {selectedChat.type === 'group' && (
                  <p className="text-xs text-blue-100">
                    {selectedChat.participants.length} أعضاء
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.senderId === 'me' ? '' : 'flex gap-2'}`}>
                  {message.senderId !== 'me' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {selectedChat.participants.find(p => p.id === message.senderId)?.avatar || '👤'}
                    </div>
                  )}
                  
                  <div>
                    {/* Text Message */}
                    {message.type === 'text' && (
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.senderId === 'me'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    )}

                    {/* Image Message */}
                    {message.type === 'image' && (
                      <div className="rounded-2xl overflow-hidden">
                        <img src={message.imageUrl} alt="صورة" className="w-full" />
                        {message.content && (
                          <div className={`px-4 py-2 ${message.senderId === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            <p>{message.content}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Offer Card */}
                    {message.type === 'price_offer' && message.priceOffer && (
                      <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-blue-900">💼 عرض سعر</h3>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">الخدمة:</span>
                            <span className="font-semibold">{message.priceOffer.service}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">السعر:</span>
                            <span className="font-bold text-green-600 text-lg">
                              {message.priceOffer.price}{message.priceOffer.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المدة:</span>
                            <span className="font-semibold">{message.priceOffer.duration}</span>
                          </div>
                        </div>

                        {message.senderId !== 'me' && message.priceOffer.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAcceptOffer(message.priceOffer!);
                              }}
                              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition-all"
                            >
                              💰 قبول ودفع
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNegotiate(message.priceOffer!.id);
                              }}
                              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all"
                            >
                              تفاوض
                            </button>
                          </div>
                        )}

                        {message.priceOffer.status === 'accepted' && (
                          <div className="bg-green-100 border border-green-300 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-green-800 font-bold">
                              <span>✓ تم قبول العرض</span>
                            </div>
                            <div className="text-xs text-green-700">
                              🔒 المبلغ محجوز في Escrow
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Project Card */}
                    {message.type === 'project' && message.project && (
                      <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-bold text-purple-900">🎯 مشروع</h3>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h4 className="font-bold text-lg">{message.project.title}</h4>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الميزانية:</span>
                            <span className="font-bold text-purple-600">
                              {message.project.budget}{message.project.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الموعد النهائي:</span>
                            <span className="font-semibold">{message.project.deadline}</span>
                          </div>
                        </div>

                        {message.senderId !== 'me' && (
                          <button
                            type="button"
                            onClick={() => alert('قم بتقديم عرضك على المشروع!')}
                            className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all"
                          >
                            📝 تقديم عرض
                          </button>
                        )}
                      </div>
                    )}

                    {/* Job Card */}
                    {message.type === 'job' && message.job && (
                      <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Briefcase className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="font-bold text-orange-900">💼 وظيفة</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-bold text-lg">{message.job.title}</h4>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الراتب:</span>
                            <span className="font-bold text-orange-600">
                              {message.job.salary}{message.job.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">النوع:</span>
                            <span className="font-semibold">
                              {message.job.type === 'full-time' && 'دوام كامل'}
                              {message.job.type === 'part-time' && 'دوام جزئي'}
                              {message.job.type === 'freelance' && 'عمل حر'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ar })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-3 sticky bottom-0">
            <div className="flex items-end gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border p-2 min-w-[200px]">
                    <label className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-right cursor-pointer">
                      <Image className="w-5 h-5 text-blue-500" />
                      <span>صورة</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                    <label className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors text-right cursor-pointer">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span>ملف</span>
                      <input 
                        type="file" 
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                    <button 
                      onClick={() => {
                        setShowAttachMenu(false);
                        setShowOfferModal(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors text-right"
                    >
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span>إنشاء عرض سعر</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowAttachMenu(false);
                        setShowOffersList(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors text-right"
                    >
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>إرسال عرض موجود</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowAttachMenu(false);
                        setShowProjectModal(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg transition-colors text-right"
                    >
                      <Briefcase className="w-5 h-5 text-orange-500" />
                      <span>مشروع</span>
                    </button>
                  </div>
                )}
                
                {uploadingFile && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border p-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-500 animate-bounce" />
                      <span className="text-sm">جاري الرفع...</span>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold">اختر مشروع</h2>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {!Array.isArray(projects) || projects.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد مشاريع متاحة</p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSendProject(project.id)}
                    className="w-full bg-white border-2 border-purple-200 rounded-xl p-4 text-right hover:bg-purple-50 transition-colors"
                  >
                    <h3 className="font-bold mb-2">{project.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الميزانية:</span>
                      <span className="font-bold text-purple-600">${project.budget_min || 0}-${project.budget_max || 0}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offers List Modal */}
      {showOffersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold">اختر عرض سعر</h2>
              <button 
                onClick={() => setShowOffersList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {!Array.isArray(offers) || offers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد عروض متاحة</p>
              ) : (
                offers.map((offer) => (
                  <button
                    key={offer.id}
                    onClick={() => handleSendOffer(offer.id)}
                    className="w-full bg-white border-2 border-green-200 rounded-xl p-4 text-right hover:bg-green-50 transition-colors"
                  >
                    <h3 className="font-bold mb-2">{offer.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-bold text-green-600">${offer.price}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold">إنشاء عرض سعر</h2>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">اسم الخدمة *</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="مثال: تصميم موقع إلكتروني"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">الوصف *</label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="اشرح تفاصيل الخدمة وما سيتم تقديمه..."
                  rows={4}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">السعر ($) *</label>
                  <input
                    type="number"
                    value={offerForm.price}
                    onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                    placeholder="500"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">المدة (أيام) *</label>
                  <input
                    type="number"
                    value={offerForm.duration_days}
                    onChange={(e) => setOfferForm({ ...offerForm, duration_days: e.target.value })}
                    placeholder="10"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateOffer}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 active:scale-95 transition-all"
                >
                  إرسال العرض
                </button>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </ProtectedRoute>
  );
}
