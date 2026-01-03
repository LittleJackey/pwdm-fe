import type { FormRules } from 'element-plus'
import { reactive } from 'vue'

/** 密码正则
 * 该正则表达式用于校验密码是否符合以下条件：
 * - 至少包含一个大写字母
 * - 至少包含一个小写字母
 * - 至少包含一个数字
 * - 至少包含一个特殊字符（例如：@#$%^&+=!）
 * - 长度在8到24个字符之间
 */
export const REGEXP_PWD = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%^&+=!]).{8,24}$/

export const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 20, message: '用户名应该为5-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: REGEXP_PWD, message: '密码必须包含大写字母、小写字母、数字和特殊字符，且长度为8-24位', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4个字符', trigger: 'blur' }
  ]
})

export const updateMyProfileRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 20, message: '用户名应该为5-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: REGEXP_PWD, message: '密码必须包含大写字母、小写字母、数字和特殊字符，且长度为8-24位', trigger: 'blur' }
  ]
})

export const addOrUpdateAccountRules = reactive<FormRules>({
  website: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { max: 64, message: '长度不超过 64 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入url', trigger: 'blur' },
    { max: 500, message: '长度不超过 500 个字符', trigger: 'blur' }
  ],
  officialAccessUrl: [{ max: 500, message: '长度不超过 500 个字符', trigger: 'blur' }],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 64, message: '长度不超过 64 个字符', trigger: 'blur' }
  ],
  nickname: [{ max: 64, message: '长度不超过 64 个字符', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { max: 64, message: '长度不超过 64 个字符', trigger: 'blur' }
  ],
  email: [{ max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }],
  secEmail: [{ max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }],
  phone: [{ max: 20, message: '长度不超过 20 个字符', trigger: 'blur' }],
  owner: [{ max: 30, message: '长度不超过 30 个字符', trigger: 'blur' }],
  notes: [
    { required: true, message: '请输入备注', trigger: 'blur' },
    { max: 200, message: '长度不超过 200 个字符', trigger: 'blur' }
  ],
  mfaProvider: [{ max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }],
  securityQuestion1: [
    { required: false, message: '请输入安全问题1', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  securityAnswer1: [
    { required: false, message: '请输入安全答案1', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  securityQuestion2: [
    { required: false, message: '请输入安全问题2', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  securityAnswer2: [
    { required: false, message: '请输入安全答案2', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  securityQuestion3: [
    { required: false, message: '请输入安全问题3', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  securityAnswer3: [
    { required: false, message: '请输入安全答案3', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ]
})
