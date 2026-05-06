<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', password: string): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits('update:modelValue', v)
  }
})

// ---- 选项 ----
const charsetLower = 'abcdefghijklmnopqrstuvwxyz'
const charsetUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const charsetDigits = '0123456789'

const options = reactive({
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  symbolChars: "!@#$%^&*()_+-=[]{}|;:',.<>?/",
  length: 16,
  excludeEnabled: true,
  exclude: 'iIl1oO0'
})

// ---- 生成的密码 ----
const password = ref('')

// 构建有效字符集
const charset = computed(() => {
  let chars = ''
  if (options.lower) chars += charsetLower
  if (options.upper) chars += charsetUpper
  if (options.digits) chars += charsetDigits
  if (options.symbols) chars += options.symbolChars

  if (options.excludeEnabled && options.exclude) {
    const excludeSet = new Set(options.exclude.split(''))
    chars = chars
      .split('')
      .filter((c) => !excludeSet.has(c))
      .join('')
  }
  return chars
})

const charsetInvalid = computed(() => charset.value.length === 0)
const anyTypeSelected = computed(() => options.lower || options.upper || options.digits || options.symbols)
const excludeInvalid = computed(() => {
  if (!anyTypeSelected.value) return false
  if (!options.excludeEnabled || !options.exclude) return false
  return charset.value.length === 0
})

// ---- 生成密码 ----
function generate() {
  const chars = charset.value
  if (chars.length === 0) {
    password.value = ''
    return
  }

  const maxValid = Math.floor(0x100000000 / chars.length) * chars.length
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)

  let result = ''
  for (let i = 0; i < options.length; i++) {
    let rnd = array[i]
    // 拒绝采样消除模偏差，确保均匀分布
    if (rnd >= maxValid) {
      const tmp = new Uint32Array(1)
      do {
        crypto.getRandomValues(tmp)
        rnd = tmp[0]
      } while (rnd >= maxValid)
    }
    result += chars.charAt(rnd % chars.length)
  }
  password.value = result
}

// 弹窗打开时生成 / 选项变化时重新生成
watch(visible, (v) => {
  if (v) generate()
})

watch(
  () => [
    options.lower,
    options.upper,
    options.digits,
    options.symbols,
    options.symbolChars,
    options.length,
    options.excludeEnabled,
    options.exclude
  ],
  () => generate()
)

// ---- 密码分析工具函数 ----
function analyzeCharTypes(pwd: string) {
  let lower = 0, upper = 0, digit = 0, symbol = 0
  for (const ch of pwd) {
    if (ch >= 'a' && ch <= 'z') lower++
    else if (ch >= 'A' && ch <= 'Z') upper++
    else if (ch >= '0' && ch <= '9') digit++
    else symbol++
  }
  const typeCount = (lower > 0 ? 1 : 0) + (upper > 0 ? 1 : 0) + (digit > 0 ? 1 : 0) + (symbol > 0 ? 1 : 0)
  const hasLetters = lower + upper > 0
  const onlyLetters = hasLetters && digit === 0 && symbol === 0
  const onlyAlphanumeric = hasLetters && digit > 0 && symbol === 0
  const onlyMixedCase = onlyLetters && lower > 0 && upper > 0
  return { lower, upper, digit, symbol, typeCount, hasLetters, onlyLetters, onlyAlphanumeric, onlyMixedCase }
}

function hasRepeatedSequence(pwd: string): boolean {
  for (let i = 0; i < pwd.length - 2; i++) {
    if (pwd[i] === pwd[i + 1] && pwd[i + 1] === pwd[i + 2]) return true
  }
  return false
}

function hasSequentialChars(pwd: string): boolean {
  const lower = pwd.toLowerCase()
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i)
    const c2 = lower.charCodeAt(i + 1)
    const c3 = lower.charCodeAt(i + 2)
    if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) return true
  }
  return false
}

function looksLikePhoneOrDate(pwd: string): boolean {
  if (!/^\d+$/.test(pwd)) return false
  if (pwd.length === 11 && pwd[0] === '1') return true
  if (pwd.length === 8 || pwd.length === 6) return true
  return pwd.length >= 7 && pwd.length <= 13
}

// 键盘连续排列（同行或同列）
const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890']
const keyboardCols = ['1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik,', '9ol.', '0p;/']

function hasKeyboardPattern(pwd: string): boolean {
  const lower = pwd.toLowerCase()
  const allPatterns = [...keyboardRows, ...keyboardCols]
  for (const row of allPatterns) {
    for (let i = 0; i <= row.length - 3; i++) {
      const fwd = row.substring(i, i + 3)
      const rev = fwd.split('').reverse().join('')
      if (lower.includes(fwd) || lower.includes(rev)) return true
    }
  }
  return false
}

function hasRepeatedSegments(pwd: string): boolean {
  const lower = pwd.toLowerCase()
  for (let len = 3; len <= Math.floor(lower.length / 2); len++) {
    for (let i = 0; i <= lower.length - len * 2; i++) {
      if (lower.substring(i + len, i + len * 2) === lower.substring(i, i + len)) return true
    }
  }
  return false
}

function containsYear(pwd: string): boolean {
  return /(19|20)\d{2}/.test(pwd)
}

function isCommonPattern(pwd: string): boolean {
  const lower = pwd.toLowerCase()
  const patterns = [
    // 最常用的弱密码
    'password', 'password1', 'password123', 'admin', 'administrator', 'root', 'user', 'guest',
    '123456', '12345678', '123456789', '1234567890', '123123', '111111', '000000', '666666',
    'qwerty', 'qwertyuiop', 'qwerty123', 'asdfgh', 'asdfghjkl', 'zxcvbn', 'zxcvbnm',
    'iloveyou', 'monkey', 'dragon', 'master', 'welcome', 'letmein', 'trustno1',
    'abc123', '123abc', 'sunshine', 'princess', 'football', 'baseball',
    // 常见人名(女性 Top 10)
    'jennifer', 'jessica', 'amanda', 'ashley', 'sarah', 'melissa', 'nicole', 'stephanie', 'elizabeth', 'hannah',
    // 常见人名(男性 Top 10)
    'michael', 'christopher', 'matthew', 'joshua', 'andrew', 'daniel', 'david', 'james', 'robert', 'john',
    // 常见词汇
    'ilove', 'loveme', 'fuckyou', 'fuckme', 'ak47', 'shadow', 'hunter', 'killer',
    'starwars', 'naruto', 'pokemon', 'batman', 'superman', 'spiderman',
    'michaeljordan', 'tigger', 'pepper', 'ginger', 'cookie', 'cheese',
    'hello', 'goodbye', 'nothing', 'whatever', 'changeme',
    // 常见公司/品牌
    'google', 'facebook', 'twitter', 'instagram', 'microsoft', 'apple', 'amazon', 'samsung',
    'linkedin', 'snapchat', 'whatsapp', 'youtube', 'netflix',
    // 常见模式
    'passw0rd', 'p@ssword', 'p@ssw0rd', 'letmein', 'welcome1',
    'qazwsx', 'qweasd', '1q2w3e', '1qaz2wsx', 'zaqxsw',
    // 中文相关
    'woaini', '5201314', 'woaijia', 'ilovechina',
    // 常见体育队伍/运动
    'liverpool', 'chelsea', 'arsenal', 'barcelona', 'realmadrid',
    'hockey', 'soccer', 'cricket', 'baseball1',
    // 常见颜色/动物
    'mustang', 'corvette', 'ferrari', 'mercedes', 'porsche',
    'dolphin', 'eagle', 'tiger', 'lion',
    // 常见数字序列
    '121212', '123321', '112233', '654321', '0987654321',
    '12341234', '43214321', 'qwe123', 'asd123',
  ]
  return patterns.some((p) => lower.includes(p))
}

function endsWithCommonSuffix(pwd: string): boolean {
  return /[!@#]$/.test(pwd) || /(123|1234|12345|\d{1,4})$/.test(pwd)
}

// ---- 密码强度（基于规则评分） ----
const strengthResult = computed(() => {
  const pwd = password.value
  if (!pwd || charset.value.length === 0) return { score: 0, level: 0, label: '-', color: '#909399', diversity: '', typeCount: 0, messages: [], crackTime: '-', poolSize: 0 }

  const types = analyzeCharTypes(pwd)

  // 实际字符池大小
  let poolSize = 0
  if (types.lower > 0) poolSize += 26
  if (types.upper > 0) poolSize += 26
  if (types.digit > 0) poolSize += 10
  if (types.symbol > 0) poolSize += 33

  // ---- 加分项 ----
  let score = 0
  // 长度：非线性评分，短密码得分极低
  if (pwd.length < 6) {
    score += pwd.length * 2        // 4位=8, 5位=10
  } else if (pwd.length < 10) {
    score += 10 + (pwd.length - 6) * 5  // 6位=10, 7位=15, 8位=20, 9位=25
  } else if (pwd.length < 16) {
    score += 25 + (pwd.length - 10) * 2.5  // 10位=25, 12位=30, 15位=37.5
  } else if (pwd.length < 20) {
    score += 37.5 + (pwd.length - 16) * 1.5  // 16位=37.5, 19位=42
  } else {
    score += 45  // 20位及以上
  }
  // 字符类型（短密码的类型加分按长度打折）
  const typeMultiplier = Math.min(1, pwd.length / 12)
  if (types.lower > 0) score += 8 * typeMultiplier
  if (types.upper > 0) score += 10 * typeMultiplier
  if (types.digit > 0) score += 8 * typeMultiplier
  if (types.symbol > 0) score += 12 * typeMultiplier
  // 混合
  if (types.typeCount >= 2) score += 5 * typeMultiplier
  if (types.typeCount >= 3) score += 10 * typeMultiplier
  if (types.typeCount >= 4) score += 12 * typeMultiplier

  // ---- 扣分项与消息 ----
  interface Msg { text: string; type: 'warning' | 'info' | 'positive' }
  const messages: Msg[] = []

  // 单一字符类型惩罚：长密码（如密码短语）大幅降低惩罚（NIST SP 800-63B 理念）
  if (types.typeCount === 1 && pwd.length >= 6) {
    if (pwd.length >= 20) {
      messages.push({ text: '长密码短语，虽然只有一种字符类型，但长度足够，黑客极难破解。', type: 'positive' })
    } else if (pwd.length >= 16) {
      score -= 5
      if (types.lower > 0) messages.push({ text: '仅包含小写字母，混入数字或符号会更安全。', type: 'info' })
      else if (types.upper > 0) messages.push({ text: '仅包含大写字母，混入数字或符号会更安全。', type: 'info' })
      else if (types.digit > 0) messages.push({ text: '仅包含数字，混入字母或符号会更安全。', type: 'info' })
      else if (types.symbol > 0) messages.push({ text: '仅包含特殊字符，混入字母或数字会更安全。', type: 'info' })
    } else if (pwd.length >= 12) {
      score -= 12
      if (types.lower > 0) messages.push({ text: '仅包含小写字母，较容易被计算机猜解。', type: 'warning' })
      else if (types.upper > 0) messages.push({ text: '仅包含大写字母，较容易被计算机猜解。', type: 'warning' })
      else if (types.digit > 0) messages.push({ text: '仅包含数字，较容易被计算机猜解。', type: 'warning' })
      else if (types.symbol > 0) messages.push({ text: '仅包含特殊字符，较容易被计算机猜解。', type: 'warning' })
    } else {
      score -= 25
      if (types.lower > 0) messages.push({ text: '仅包含小写字母，极易被计算机猜解。', type: 'warning' })
      else if (types.upper > 0) messages.push({ text: '仅包含大写字母，极易被计算机猜解。', type: 'warning' })
      else if (types.digit > 0) messages.push({ text: '仅包含数字，极易被计算机猜解。', type: 'warning' })
      else if (types.symbol > 0) messages.push({ text: '仅包含特殊字符，极易被计算机猜解。', type: 'warning' })
    }
  }

  if (types.onlyMixedCase && pwd.length >= 8) {
    if (pwd.length >= 20) {
      score -= 0
    } else if (pwd.length >= 16) {
      score -= 3
      messages.push({ text: '仅包含大小写字母，缺少数字或符号。', type: 'info' })
    } else if (pwd.length >= 12) {
      score -= 6
      messages.push({ text: '仅包含大小写字母，缺少数字或符号。', type: 'warning' })
    } else {
      score -= 10
      messages.push({ text: '仅包含大小写字母，缺少数字或符号。', type: 'warning' })
    }
  }

  if (types.onlyAlphanumeric && types.typeCount === 3 && pwd.length >= 8) {
    if (pwd.length >= 16) {
      score -= 0
    } else if (pwd.length >= 12) {
      score -= 2
      messages.push({ text: '缺少特殊符号，加上一个会更安全。', type: 'info' })
    } else {
      score -= 5
      messages.push({ text: '缺少特殊符号，加上一个即可大幅提升安全性。', type: 'info' })
    }
  }

  // 标记关键缺陷是否存在，用于后续消息去重
  const hasCriticalPattern = isCommonPattern(pwd) || hasKeyboardPattern(pwd)

  if (hasSequentialChars(pwd) && !hasCriticalPattern) {
    score -= 15
    messages.push({ text: '包含连续字符（如 abc、123），容易被破解。', type: 'warning' })
  }

  if (hasRepeatedSequence(pwd) && !hasCriticalPattern) {
    score -= 15
    messages.push({ text: '包含重复字符（如 aaa、111），降低了密码复杂度。', type: 'warning' })
  }

  if (looksLikePhoneOrDate(pwd)) {
    score -= 15
    messages.push({ text: '看起来像电话号码或日期格式，容易被针对猜测。', type: 'warning' })
  }

  if (hasKeyboardPattern(pwd)) {
    score -= 15
    messages.push({ text: '包含键盘排列（如 qwerty、asdf），是黑客字典中最常见的模式之一。', type: 'warning' })
  }

  if (isCommonPattern(pwd)) {
    score -= 20
    messages.push({ text: '包含常见弱密码片段，极易被字典攻击破解。', type: 'warning' })
  }

  if (hasRepeatedSegments(pwd) && !hasCriticalPattern) {
    score -= 10
    messages.push({ text: '包含重复片段（如 abc123 出现两次），降低了密码复杂度。', type: 'warning' })
  }

  if (containsYear(pwd) && !isCommonPattern(pwd)) {
    score -= 8
    messages.push({ text: '包含年份（19xx/20xx），容易被联系到个人信息。', type: 'info' })
  }

  if (endsWithCommonSuffix(pwd) && types.typeCount >= 2 && !hasCriticalPattern) {
    score -= 5
    messages.push({ text: '以常见数字或符号结尾（如 !、123），容易被猜到。', type: 'info' })
  }

  // ---- 正向反馈 ----
  if (types.typeCount === 4) {
    messages.push({ text: '覆盖了大小写字母、数字和符号四类字符，破解难度极高。', type: 'positive' })
  }

  if (pwd.length >= 20) {
    messages.push({ text: '密码长度 ≥ 20 位，暴力破解几乎不可能。', type: 'positive' })
  } else if (pwd.length >= 16) {
    messages.push({ text: '密码长度 ≥ 16 位，安全性较高。', type: 'positive' })
  }

  if (pwd.length >= 16 && types.typeCount === 1 && !hasSequentialChars(pwd) && !isCommonPattern(pwd)) {
    messages.push({ text: '长度带来的安全性足以弥补字符类型的单一。', type: 'positive' })
  }

  if (pwd.length >= 12 && types.typeCount >= 3 && messages.filter(m => m.type === 'warning').length === 0) {
    messages.push({ text: '未检测到常见弱密码特征，密码强度良好。', type: 'positive' })
  }

  // ---- 消息去重：同一条消息最多推送一个 positive 和一条 warning/info ----
  // 保持 warning > info > positive 的优先级，最多保留 4 条
  const warnings = messages.filter(m => m.type === 'warning')
  const infos = messages.filter(m => m.type === 'info')
  const positives = messages.filter(m => m.type === 'positive')

  // 去重：warning 最多的前 3 条，info 最多前 2 条，positive 最多前 2 条
  messages.length = 0
  messages.push(...warnings.slice(0, 3))
  messages.push(...infos.slice(0, 2))
  messages.push(...positives.slice(0, 2))

  // 总数上限 5 条
  if (messages.length > 5) {
    messages.length = 5
  }

  score = Math.max(0, Math.min(100, score))

  // ---- 等级映射 ----
  let level: number, label: string, color: string
  if (score >= 80) { level = 5; label = '极强'; color = '#15803D' }
  else if (score >= 60) { level = 4; label = '很强'; color = '#16A34A' }
  else if (score >= 40) { level = 3; label = '强'; color = '#CA8A04' }
  else if (score >= 20) { level = 2; label = '一般'; color = '#D97706' }
  else { level = 1; label = '简单'; color = '#DC2626' }

  // ---- 字符多样性描述 ----
  const parts: string[] = []
  if (types.lower > 0) parts.push('小写字母')
  if (types.upper > 0) parts.push('大写字母')
  if (types.digit > 0) parts.push('数字')
  if (types.symbol > 0) parts.push('特殊字符')
  const diversity = parts.join('、')

  // ---- 破解耗时（基于实际字符池，假设慢速哈希 bcrypt/Argon2） ----
  let guessesPerSecond = 5e4

  if (types.typeCount === 1 && types.digit > 0) guessesPerSecond *= 10
  else if (types.typeCount === 1) guessesPerSecond *= 5

  // 计算平均破解时间（遍历一半组合空间）
  const seconds = Math.pow(poolSize, pwd.length) / (2 * guessesPerSecond)

  let crackTime: string
  const years = seconds / 31536000
  if (seconds < 1) crackTime = '瞬间'
  else if (seconds < 60) crackTime = `${Math.round(seconds)} 秒`
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} 分钟`
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} 小时`
  else if (seconds < 604800) crackTime = `${Math.round(seconds / 86400)} 天`
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 604800)} 周`
  else if (years < 10000) crackTime = `${Math.round(years)} 年`
  else if (years < 1e8) crackTime = `约 ${Math.round(years / 1e4)} 万年`
  else crackTime = `约 ${Math.round(years / 1e8)} 亿年`

  return { score, level, label, color, diversity, typeCount: types.typeCount, messages, crackTime, poolSize }
})

const strengthLevel = computed(() => ({
  level: strengthResult.value.level,
  label: strengthResult.value.label,
  color: strengthResult.value.color
}))

const strengthPercent = computed(() => (strengthResult.value.level / 5) * 100)

const crackTime = computed(() => strengthResult.value.crackTime)

// ---- 复制 ----
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null
async function handleCopy() {
  if (!password.value) return
  try {
    await navigator.clipboard.writeText(password.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback
    const textarea = document.createElement('textarea')
    textarea.value = password.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// ---- 确认 ----
function handleConfirm() {
  if (!password.value) return
  emits('confirm', password.value)
  visible.value = false
}

function handleClose() {
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" draggable title="随机密码生成" width="520px" align-center @close="handleClose">
    <!-- 密码展示区 -->
    <div class="password-display">
      <div class="password-field" :class="{ placeholder: !password }">
        {{ password || '请至少选择一种字符类型' }}
      </div>
      <div class="password-actions">
        <el-tooltip :content="copied ? '已复制' : '复制密码'" placement="top">
          <el-button
            :type="copied ? 'success' : 'default'"
            :icon="copied ? 'Check' : 'CopyDocument'"
            circle
            size="small"
            @click="handleCopy"
            :disabled="!password"
          />
        </el-tooltip>
        <el-tooltip content="重新生成" placement="top">
          <el-button :icon="'RefreshRight'" circle size="small" @click="generate" :disabled="charsetInvalid" />
        </el-tooltip>
      </div>
    </div>

    <!-- 强度信息卡片 -->
    <div class="strength-card">
      <div class="card-row">
        <span class="card-label">密码强度</span>
        <span class="card-value" :style="{ color: strengthLevel.color }">{{ strengthLevel.label }}</span>
      </div>
      <div class="strength-bar">
        <div class="strength-fill" :style="{ width: strengthPercent + '%', backgroundColor: strengthLevel.color }" />
      </div>
      <div class="card-row">
        <span class="card-label">破解耗时</span>
        <span class="card-value">{{ crackTime }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">字符多样性</span>
        <span
          class="card-value"
          :style="{
            color:
              strengthResult.typeCount >= 3
                ? '#16A34A'
                : strengthResult.typeCount <= 1
                  ? '#DC2626'
                  : undefined
          }"
        >{{ strengthResult.diversity || '-' }}</span>
      </div>
      <template v-if="strengthResult.messages.length > 0">
        <div class="card-divider" />
        <div class="messages-list">
          <div v-for="(m, i) in strengthResult.messages" :key="i" class="msg-item" :class="'msg-' + m.type">
            <span class="msg-bullet">·</span>
            <span>{{ m.text }}</span>
          </div>
        </div>
      </template>
    </div>

    <el-divider />

    <!-- 字符类型选择 -->
    <div class="option-group">
      <div class="option-label">字符类型</div>
      <div class="checkbox-row">
        <el-checkbox v-model="options.lower">小写字母 a-z</el-checkbox>
        <el-checkbox v-model="options.upper">大写字母 A-Z</el-checkbox>
        <el-checkbox v-model="options.digits">数字 0-9</el-checkbox>
      </div>
      <div class="symbol-row">
        <el-checkbox v-model="options.symbols">特殊字符</el-checkbox>
        <el-input v-model="options.symbolChars" :disabled="!options.symbols" maxlength="60" class="symbol-input" />
      </div>
      <div v-if="!anyTypeSelected" class="option-hint error">请至少选择一种字符类型</div>
    </div>

    <!-- 排除字符 -->
    <div class="option-group">
      <div class="option-label">排除字符</div>
      <div class="exclude-row">
        <el-checkbox v-model="options.excludeEnabled" />
        <el-input
          v-model="options.exclude"
          placeholder="输入需要排除的字符"
          maxlength="50"
          clearable
          :disabled="!options.excludeEnabled"
        />
      </div>
      <div v-if="excludeInvalid" class="option-hint error">排除后无可选字符，请调整</div>
    </div>

    <!-- 密码长度 -->
    <div class="option-group">
      <div class="option-label">密码长度</div>
      <div class="length-row">
        <el-slider
          v-model="options.length"
          :min="1"
          :max="64"
          :show-tooltip="false"
          :marks="{ 1: '1', 6: '6', 8: '8', 12: '12', 16: '16', 20: '20', 32: '32', 48: '48', 64: '64' }"
          class="length-slider"
        />
        <el-input-number v-model="options.length" :min="1" :max="64" size="small" class="length-input" />
        <span class="length-unit">位</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!password"> 使用此密码 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.password-display {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.password-field {
  flex: 1;
  font-size: 20px;
  font-family: 'Courier New', Consolas, monospace;
  letter-spacing: 2px;
  word-break: break-all;
  color: var(--el-text-color-primary);
  min-height: 28px;
  line-height: 28px;

  &.placeholder {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
    letter-spacing: 0;
    font-family: inherit;
  }
}

.password-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.strength-card {
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 4px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  line-height: 1.8;
}

.card-label {
  color: var(--el-text-color-secondary);
}

.card-value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.strength-bar {
  height: 10px;
  background: var(--el-fill-color);
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
}

.strength-fill {
  height: 100%;
  border-radius: 5px;
  transition:
    width 0.3s,
    background-color 0.3s;
}

.card-divider {
  border-top: 1px dashed var(--el-border-color);
  margin: 10px 0;
}

.messages-list {
  font-size: 13px;
}

.msg-item {
  display: flex;
  gap: 6px;
  line-height: 1.7;
}

.msg-warning {
  color: #D97706;
}

.msg-info {
  color: #78716C;
}

.msg-positive {
  color: #16A34A;
}

.msg-bullet {
  flex-shrink: 0;
}

.option-group {
  margin-bottom: 16px;
}

.option-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.symbol-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.symbol-input {
  flex: 1;

  :deep(.el-input__inner) {
    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }
}

.length-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.length-slider {
  flex: 1;
  margin-bottom: 6px;

  :deep(.el-slider__marks-text) {
    font-size: 11px;
  }
}

.length-input {
  width: 100px;
}

.length-unit {
  font-size: 14px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}

.exclude-row {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-input__inner) {
    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }
}

.option-hint {
  font-size: 12px;
  margin-top: 4px;

  &.error {
    color: var(--el-color-danger);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-divider) {
  margin: 8px 0 16px;
}
</style>
