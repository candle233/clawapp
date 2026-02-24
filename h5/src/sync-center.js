/**
 * 跨设备同步模块
 *
 * 发送端：syncToDevices(title, text) → 向所有其他已连接设备广播 proxy.sync 事件
 * 接收端：handleSyncEvent(data, cb) → 收到其他设备的同步消息时调用 cb
 *
 * 协议：
 *   client → server  { type:"req", method:"broadcast.sync", params:{ title, text } }
 *   server → others  { type:"event", event:"proxy.sync", data:{ title, text, timestamp } }
 *   server → client  { type:"res", ok:true, payload:{ delivered, total, timestamp } }
 */

import { wsClient } from './ws-client.js'

/**
 * 向所有其他已连接设备发送同步消息
 * @param {string} title
 * @param {string} text
 * @returns {Promise<{ delivered: number, total: number, timestamp: number }>}
 */
export async function syncToDevices(title, text) {
  return wsClient.request('broadcast.sync', { title, text })
}

/**
 * 处理收到的跨设备同步事件（来自其他设备）
 * @param {{ title: string, text: string, timestamp: number }} data
 * @param {(data: object) => void} onCard  - 回调：展示同步接收卡片
 */
export function handleSyncEvent(data, onCard) {
  if (!data) return
  const { title, text, timestamp } = data

  // 系统通知（如支持且已授权）
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title || 'ClawApp Sync', {
        body: text,
        tag: 'clawapp-sync',
      })
    } catch (_) { /* ignore */ }
  }

  onCard?.({ type: 'incoming', title, text, timestamp })
}
