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
