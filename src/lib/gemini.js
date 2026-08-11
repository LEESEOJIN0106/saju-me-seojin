import { GoogleGenAI } from '@google/genai'
import { buildBasicChartPrompt } from './sajuPrompt'

const MODEL = 'gemini-3.6-flash'

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key || typeof key !== 'string') return ''
  return key.trim().replace(/\s+/g, '')
}

/**
 * 기본 차트 해석을 Gemini에 요청한다.
 * @param {Parameters<typeof buildBasicChartPrompt>[0]} profile
 */
export async function interpretBasicChart(profile) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error(
      'Gemini API 키가 없습니다. .env에 VITE_GEMINI_API_KEY를 설정해 주세요.',
    )
  }

  const ai = new GoogleGenAI({ apiKey })
  const prompt = buildBasicChartPrompt(profile)

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: prompt,
  })

  const text = interaction?.output_text?.trim()
  if (!text) {
    throw new Error('해석 결과를 받지 못했습니다. 잠시 후 다시 시도해 주세요.')
  }

  return text
}
