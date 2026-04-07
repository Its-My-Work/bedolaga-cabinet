import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mtproxyApi } from '../api/mtproxy';
import { Card } from '@/components/data-display/Card/Card';
import { Button } from '@/components/primitives/Button/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import { useNotify } from '@/platform/hooks/useNotify';

const ShieldIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.122a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

function formatPrice(kopeks: number): string {
  return kopeks % 100 === 0 ? `${kopeks / 100} ₽` : `${(kopeks / 100).toFixed(2)} ₽`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(iso: string | null): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function MTProxy() {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['mtproxy-status'],
    queryFn: mtproxyApi.getStatus,
    refetchInterval: 30000,
  });

  const purchaseMutation = useMutation({
    mutationFn: mtproxyApi.purchase,
    onSuccess: (data) => {
      if (data.success) {
        notify.success('Прокси создан!');
        queryClient.invalidateQueries({ queryKey: ['mtproxy-status'] });
      } else {
        notify.error(data.error || 'Ошибка создания');
      }
    },
    onError: (e: any) => {
      notify.error(e?.response?.data?.detail || 'Ошибка покупки');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mtproxyApi.deleteProxy,
    onSuccess: (data) => {
      if (data.success) {
        const msg = data.refund_kopeks > 0
          ? `Прокси удалён. Возврат: ${formatPrice(data.refund_kopeks)}`
          : 'Прокси удалён';
        notify.success(msg);
        queryClient.invalidateQueries({ queryKey: ['mtproxy-status'] });
      }
      setConfirmDelete(null);
    },
    onError: () => {
      notify.error('Ошибка удаления');
      setConfirmDelete(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!status?.enabled) {
    return (
      <div className="p-4 text-center text-gray-400">
        <ShieldIcon />
        <p className="mt-2">Telegram Proxy временно недоступен</p>
      </div>
    );
  }

  const activeProxies = status.proxies.filter(p => p.active);

  return (
    <motion.div
      className="space-y-4 p-4 pb-24"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <ShieldIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold">Прокси для Telegram</h1>
              <p className="text-sm text-gray-400">Быстрый и безопасный доступ</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{activeProxies.length}</p>
              <p className="text-xs text-gray-400">Активных</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{formatPrice(status.price_30d)}</p>
              <p className="text-xs text-gray-400">за 30 дней</p>
            </div>
          </div>

          <Button
            onClick={() => purchaseMutation.mutate()}
            disabled={purchaseMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3 rounded-xl"
          >
            {purchaseMutation.isPending ? 'Создание...' : `🛒 Купить прокси (${formatPrice(status.price_30d)})`}
          </Button>

          {status.is_admin && (
            <p className="text-xs text-yellow-400 text-center mt-2">👑 Админ: бесплатно</p>
          )}
        </Card>
      </motion.div>

      {/* What is this? */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <h2 className="font-semibold mb-2">🚀 Что это?</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Если Telegram работает медленно или блокируется — прокси обеспечит стабильный и быстрый доступ.
          </p>
          <ul className="text-sm text-gray-300 mt-2 space-y-1">
            <li>✅ Подключение в 1 клик</li>
            <li>✅ Работает на всех устройствах</li>
            <li>✅ Не нужно устанавливать приложения</li>
          </ul>
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ Прокси работает ТОЛЬКО для Telegram! Это не VPN — браузер и другие приложения не защищены.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Instructions toggle */}
      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between"
          >
            <span className="font-semibold">📱 Инструкция по подключению</span>
            <span className="text-gray-400">{showInstructions ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 text-sm text-gray-300">
                  <div>
                    <p className="font-medium text-white">🍏 iPhone / iPad:</p>
                    <p>Настройки → Данные и память → Прокси</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">🤖 Android:</p>
                    <p>Настройки → Данные и память → Тип прокси: MTProto</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">💻 ПК / Mac:</p>
                    <p>Настройки → Продвинутые → Тип подключения → Прокси</p>
                  </div>
                  <p className="text-gray-400">Или нажмите кнопку «Подключить» — Telegram всё сделает автоматически!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Active proxies */}
      {activeProxies.length > 0 && (
        <motion.div variants={staggerItem}>
          <h2 className="text-base font-semibold mb-2 px-1">🔑 Мои прокси ({activeProxies.length})</h2>
          <div className="space-y-3">
            {activeProxies.map((proxy, i) => (
              <Card key={proxy.secret} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Прокси #{i + 1}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    {daysLeft(proxy.expires_at)} дн.
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">до {formatDate(proxy.expires_at)}</p>
                <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                  <p className="text-xs text-gray-300 break-all font-mono">{proxy.link}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={proxy.web_link || proxy.link.replace('tg://proxy?', 'https://t.me/proxy?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                  >
                    <LinkIcon /> Подключить
                  </a>
                  {confirmDelete === proxy.secret ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(proxy.secret)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                      >
                        Да
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm"
                      >
                        Нет
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(proxy.secret)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">💡 1 прокси = 1 устройство</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expired */}
      {status.proxies.filter(p => !p.active).length > 0 && (
        <motion.div variants={staggerItem}>
          <p className="text-sm text-gray-500 px-1">
            Истёкших: {status.proxies.filter(p => !p.active).length}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
