export const CITIES = [
  '京都',
  '成都',
  '厦门',
  '冰岛雷克雅未克',
  '北海道',
  '敦煌',
  '巴黎',
  '丽江',
  '威尼斯',
  '拉萨',
  '首尔弘大',
  '青岛海边',
  '东京下北泽',
  '大理古城',
  '旧金山',
  '乌镇',
  '布拉格',
  '重庆山城',
  '苏梅岛',
  '哈尔滨',
]

export const BLESSINGS = [
  '愿你今日像素清晰，烦恼掉帧。',
  '邮差路过说：你被惦记着。',
  '把好运存进卡带，随时读档。',
  '世界很大，这张卡很小，刚好装下想你。',
  '8-bit 的心意，满血送达。',
  '按下 START，继续你的冒险。',
  '今天的阳光是金色高光。',
  '给你一枚续命药水，记得喝。',
  '信箱里多了一点温柔的噪声。',
  '愿你的一天没有 lag。',
  '远方的风景，近处的惦念。',
  'HP+10，心情暴击。',
  '把想念折叠成邮票大小。',
  '通关秘密：早点睡，多喝水。',
  '这张卡没有回信地址，只有祝福。',
]

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function pickDestination() {
  return {
    city: pickRandom(CITIES),
    blessing: pickRandom(BLESSINGS),
  }
}
