<template>
  <div class="terms-consent">
    <button type="button" class="terms-consent__trigger" @click="open">
      <span class="terms-consent__box" :class="{ 'is-checked': accepted }">
        <svg v-if="accepted" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <span>
        我已阅读并同意
        <strong>《用户协议》与《隐私政策》</strong>
      </span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="terms-consent__overlay" @click.self="close">
        <section class="terms-consent__modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
          <header class="terms-consent__header">
            <div>
              <p>HabitLearner / 习知</p>
              <h2 id="terms-title">用户协议与隐私政策</h2>
            </div>
            <button type="button" aria-label="关闭" @click="close">×</button>
          </header>

          <div ref="contentRef" class="terms-consent__content" @scroll="handleScroll">
            <section>
              <p class="terms-consent__effective">生效日期：2026 年 8 月 26 日</p>
              <p>
                欢迎使用 HabitLearner（中文名“习知”）。习知是一个个人工作台产品，提供习惯追踪、计划编辑、专注计时、内容创作、收集箱、复盘、AI 辅助和账户管理等功能。
                请你在注册或使用前仔细阅读本协议与隐私政策。点击“我已阅读并同意”即表示你理解并同意以下内容。
              </p>
            </section>

            <section>
              <h3>一、用户协议</h3>
              <p>
                你应以真实、合法、善意的方式使用习知，不得利用本产品从事违法违规、侵害他人权益、破坏系统安全、批量注册、恶意爬取、绕过权限、传播恶意代码或干扰他人正常使用的行为。
                你对自己账户下创建、上传、生成或保存的内容负责，并承诺拥有相应权利或合法授权。
              </p>
              <p>
                习知会尽力保持服务稳定和数据安全，但个人工作台、AI 辅助建议、学习推荐和统计分析不构成法律、医疗、金融、投资或其他专业意见。
                你应自行判断并承担基于内容采取行动的后果。
              </p>
              <p>
                用户名是你在习知内的唯一身份铭牌，注册完成后原则上不可更改；昵称是展示名，可重复且可编辑。你应妥善保管密码、邮箱验证码和第三方登录授权。
                因你主动泄露、弱密码、共用设备或第三方平台账号风险导致的损失，由你自行承担。
              </p>
              <p>
                如你违反本协议、法律法规或危害产品安全，我们有权限制部分功能、暂停服务、要求整改或在必要时终止服务。对于重大功能、收费规则或协议条款变化，我们会以页面提示、邮件或站内通知等方式告知。
              </p>
            </section>

            <section>
              <h3>二、我们收集的信息</h3>
              <p>
                为创建和保护账户，我们可能收集用户名、昵称、头像、邮箱、密码哈希、邮箱验证码校验记录、第三方登录返回的唯一标识、昵称、头像、性别、地区、IP、登录时间和登录方式。
                如果你选择不绑定邮箱，我们不会在界面中展示占位邮箱。
              </p>
              <p>
                为提供核心功能，我们会保存你主动创建的习惯、计划块、日程、专注会话、收集内容、复盘记录、内容创作条目、主题设置、通知设置、AI 供应商配置和技能配置。
                为改善稳定性和安全性，我们可能记录必要的请求日志、错误日志、设备与浏览器基础信息、IP 地址和大致地区。
              </p>
              <p>
                我们遵循最小必要原则，不会主动索取身份证号、银行卡号、通讯录、精确定位、相册全量访问等与当前功能无关的信息。上传头像、背景图、计划图片或视频时，只处理你主动选择的文件。
              </p>
            </section>

            <section>
              <h3>三、信息使用目的</h3>
              <p>
                我们使用个人信息用于账户注册与登录、身份验证、资料展示、数据同步、计划和习惯功能运行、通知提醒、异常排查、安全风控、用户画像统计、产品体验优化和依法履行必要义务。
                用户画像只用于了解产品增长、活跃和地域分布，不会用于歧视性定价或损害用户权益的自动化决策。
              </p>
              <p>
                当你主动使用 AI 功能时，你输入的提示词、选中的计划内容、上下文片段、图片或视频生成参数可能会发送给你配置的 AI 服务提供方或我们接入的上游服务。
                请避免在 AI 输入中提交身份证号、银行卡、密码、验证码、精确住址等敏感信息。
              </p>
            </section>

            <section>
              <h3>四、第三方服务与共享</h3>
              <p>
                第三方快捷登录由聚合登录服务及微信、QQ、Google、GitHub 等平台完成授权。我们只接收完成登录所需的账户标识和基础资料，不会获取你的第三方平台密码。
                邮件验证码通过邮件服务商发送。部署、CDN、反向代理、日志、AI 上游和对象存储等基础服务可能在必要范围内处理数据。
              </p>
              <p>
                除实现功能、取得你的授权、履行法律义务、处理安全事件或维护合法权益外，我们不会出售你的个人信息，也不会向无关第三方共享可识别个人的信息。
                如未来接入新的 SDK、支付、会员或统计服务，应在隐私政策中补充说明。
              </p>
            </section>

            <section>
              <h3>五、保存期限与安全</h3>
              <p>
                我们仅在实现处理目的所必要的最短期间内保存个人信息。账户存续期间，你的工作台数据会持续保存；账户注销冷静期结束后，我们会删除或匿名化账户资料和登录绑定信息。
                法律法规要求留存、争议处理、安全审计或备份恢复所必需的信息，会在必要期限内保存。
              </p>
              <p>
                我们会采取访问控制、密码哈希、验证码校验、传输加密、权限校验、日志审计和最小化授权等措施保护数据。但互联网环境不存在绝对安全，你也需要妥善保管登录凭证并及时更新密码。
              </p>
            </section>

            <section>
              <h3>六、你的权利</h3>
              <p>
                你可以在“我的”页面查看和更正昵称、头像、邮箱绑定、第三方登录绑定、通知设置、隐私设置和主题设置。你可以导出数据、解绑登录方式、撤回非必要授权或申请注销账户。
                解绑邮箱需要邮箱验证码，解绑第三方登录需要重新完成对应平台验证，普通解绑需至少保留一种可登录方式。
              </p>
              <p>
                你可以通过产品内反馈入口或管理员邮箱联系我们，要求查询、更正、删除、复制、解释或限制处理你的个人信息。我们会在合理期限内处理你的请求；如法律法规另有规定，以法律法规为准。
              </p>
            </section>

            <section>
              <h3>七、未成年人保护</h3>
              <p>
                如果你未满 18 周岁，应在监护人同意和指导下使用习知。我们不会主动面向未成年人收集与服务无关的信息。
                如监护人认为未成年人信息被不当处理，可联系我们处理。
              </p>
            </section>

            <section>
              <h3>八、更新与联系</h3>
              <p>
                本协议与隐私政策可能因产品功能、第三方服务、法律法规或运营安排变化而更新。重大变化会通过明显方式提示，并在必要时重新取得你的同意。
                联系邮箱：GF@habitlearner.cn。
              </p>
              <p class="terms-consent__bottom">你已阅读至底部，可以点击下方按钮完成同意。</p>
            </section>
          </div>

          <footer class="terms-consent__footer">
            <button type="button" class="terms-consent__secondary" @click="close">暂不同意</button>
            <button type="button" class="terms-consent__primary" :disabled="!canAccept" @click="accept">
              {{ canAccept ? '我已阅读并同意' : '请先下拉阅读到底部' }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  accepted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:accepted'])

const isOpen = ref(false)
const canAccept = ref(false)
const contentRef = ref(null)

const handleScroll = () => {
  const el = contentRef.value
  if (!el) return
  canAccept.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
}

const open = async () => {
  isOpen.value = true
  canAccept.value = false
  await nextTick()
  const el = contentRef.value
  if (el) {
    el.scrollTop = 0
    handleScroll()
  }
}

const close = () => {
  isOpen.value = false
}

const accept = () => {
  if (!canAccept.value) return
  emit('update:accepted', true)
  close()
}

watch(() => props.accepted, (value) => {
  if (!value) canAccept.value = false
})
</script>

<style scoped>
.terms-consent__trigger {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 12px;
  border: 0;
  border-top: 1px solid rgba(228, 228, 231, 0.9);
  background: transparent;
  padding: 16px 0 0;
  color: rgb(82, 82, 91);
  font-size: 14px;
  line-height: 1.65;
  text-align: left;
}

.terms-consent__trigger strong {
  color: rgb(24, 24, 27);
}

.terms-consent__box {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  border: 1px solid rgba(113, 113, 122, 0.42);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
}

.terms-consent__box.is-checked {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
}

.terms-consent__box svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.terms-consent__overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(24, 24, 27, 0.44);
  padding: 20px;
  backdrop-filter: blur(14px);
}

.terms-consent__modal {
  display: grid;
  width: min(92vw, 760px);
  max-height: min(86vh, 820px);
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 28px;
  background: rgba(255, 252, 247, 0.98);
  box-shadow: 0 30px 90px rgba(24, 24, 27, 0.24);
}

.terms-consent__header,
.terms-consent__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
}

.terms-consent__header {
  border-bottom: 1px solid rgba(228, 228, 231, 0.86);
}

.terms-consent__header p {
  margin: 0 0 4px;
  color: rgb(113, 113, 122);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.terms-consent__header h2 {
  margin: 0;
  color: rgb(24, 24, 27);
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 750;
  letter-spacing: -0.05em;
}

.terms-consent__header > button {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(24, 24, 27, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: rgb(63, 63, 70);
  font-size: 24px;
  line-height: 1;
}

.terms-consent__content {
  overflow-y: auto;
  padding: 22px;
  color: rgb(63, 63, 70);
  font-size: 14px;
  line-height: 1.9;
}

.terms-consent__content section + section {
  margin-top: 22px;
}

.terms-consent__content h3 {
  margin: 0 0 8px;
  color: rgb(24, 24, 27);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.terms-consent__content p {
  margin: 0;
}

.terms-consent__content p + p {
  margin-top: 10px;
}

.terms-consent__effective,
.terms-consent__bottom {
  border-radius: 16px;
  background: rgba(245, 245, 244, 0.88);
  padding: 12px 14px;
  color: rgb(82, 82, 91);
}

.terms-consent__footer {
  border-top: 1px solid rgba(228, 228, 231, 0.86);
  background: rgba(255, 255, 255, 0.82);
}

.terms-consent__primary,
.terms-consent__secondary {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 800;
}

.terms-consent__primary {
  border: 0;
  background: rgb(24, 24, 27);
  color: white;
}

.terms-consent__primary:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.terms-consent__secondary {
  border: 1px solid rgba(24, 24, 27, 0.12);
  background: rgba(255, 255, 255, 0.78);
  color: rgb(63, 63, 70);
}

:global(.dark) .terms-consent__trigger {
  border-top-color: rgba(63, 63, 70, 0.88);
  color: rgb(212, 212, 216);
}

:global(.dark) .terms-consent__trigger strong {
  color: white;
}

:global(.dark) .terms-consent__box {
  border-color: rgba(161, 161, 170, 0.5);
  background: rgba(24, 24, 27, 0.86);
}

:global(.dark) .terms-consent__box.is-checked {
  border-color: white;
  background: white;
}

:global(.dark) .terms-consent__box.is-checked svg {
  stroke: rgb(24, 24, 27);
}

:global(.dark) .terms-consent__modal {
  border-color: rgba(244, 244, 245, 0.12);
  background: rgba(24, 24, 27, 0.98);
}

:global(.dark) .terms-consent__header,
:global(.dark) .terms-consent__footer {
  border-color: rgba(63, 63, 70, 0.88);
}

:global(.dark) .terms-consent__header h2,
:global(.dark) .terms-consent__content h3 {
  color: white;
}

:global(.dark) .terms-consent__content {
  color: rgb(212, 212, 216);
}

:global(.dark) .terms-consent__effective,
:global(.dark) .terms-consent__bottom {
  background: rgba(39, 39, 42, 0.92);
  color: rgb(212, 212, 216);
}

:global(.dark) .terms-consent__footer,
:global(.dark) .terms-consent__header > button,
:global(.dark) .terms-consent__secondary {
  background: rgba(39, 39, 42, 0.86);
  color: rgb(244, 244, 245);
}

@media (max-width: 640px) {
  .terms-consent__overlay {
    align-items: end;
    padding: 12px;
  }

  .terms-consent__modal {
    width: 100%;
    max-height: 88vh;
    border-radius: 24px;
  }

  .terms-consent__footer {
    flex-direction: column-reverse;
  }

  .terms-consent__primary,
  .terms-consent__secondary {
    width: 100%;
  }
}
</style>
