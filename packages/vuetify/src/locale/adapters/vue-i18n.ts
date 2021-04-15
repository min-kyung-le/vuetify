import { watch } from 'vue'

// Types
import type { Composer, I18n, LocaleMessages, useI18n, VueMessageType } from 'vue-i18n'
import type { LocaleInstance, LocaleProps } from '@/composables/locale'
import type { RtlOptions } from '@/composables/rtl'

interface VueI18nAdapterParams {
  i18n: I18n<LocaleMessages, unknown, unknown, false>
  messages: LocaleMessages
  useI18n: typeof useI18n
  rtl?: RtlOptions
}

function wrapScope (scope: Composer<LocaleMessages, unknown, unknown, VueMessageType>): LocaleInstance {
  return {
    current: scope.locale,
    fallback: scope.fallbackLocale,
    messages: scope.messages,
    t: scope.t,
  } as any // TODO: Fix this
}

export function createVueI18nAdapter ({ i18n, useI18n, rtl, messages }: VueI18nAdapterParams) {
  return {
    createRoot: () => {
      wrapScope(i18n.global)
    },
    getScope: () => {
      const scope = useI18n({ legacy: false, useScope: 'parent' }) as Composer<LocaleMessages, unknown, unknown, VueMessageType>

      return wrapScope(scope)
    },
    createScope: (props: LocaleProps) => {
      const scope = useI18n({
        legacy: false,
        useScope: 'local',
        messages: (props.messages ?? messages) as any, // TODO: Fix this
        locale: props.locale,
        fallbackLocale: props.fallbackLocale,
        inheritLocale: !props.locale,
      })

      watch(() => props.locale, () => {
        if (props.locale) {
          scope.locale.value = props.locale
        } else {
          scope.inheritLocale = true
        }
      })

      watch(() => props.fallbackLocale, () => {
        if (props.fallbackLocale) {
          scope.fallbackLocale.value = props.fallbackLocale
        }
      })

      return wrapScope(scope)
    },
    rtl,
  }
}
