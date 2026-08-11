/**
 * 기본 차트(명식) 샘플.
 * 나중에 실제 사주 계산기로 교체할 수 있도록 객체로 분리.
 */
export const SAMPLE_BASIC_CHART = {
  pillars: {
    year: '기묘',
    month: '기사',
    day: '을축',
    hour: '을유',
  },
  elements: { metal: 1, wood: 3, water: 0, fire: 1, earth: 3 },
  tenGodsStem: ['편재', '편재', '일주', '비견'],
  tenGodsBranch: ['비견', '상관', '편재', '편관'],
  hiddenStems:
    '甲 겁재,乙 비견 | 戊 정재,庚 정관,丙 상관 | 癸 편인,辛 편관,己 편재 | 庚 정관,辛 편관',
  nayin: ['성두토', '대림목', '해중금', '천중수'],
  twelveStages: ['건록', '목욕', '쇠', '절'],
  twelveShinsa: ['재살', '역마살', '월살', '재살'],
  voids: { year: '申酉', day: '戌亥' },
  monthCommand: '庚',
  daewoonNumber: 2,
  sewoon: {
    2021: '신축',
    2022: '임인',
    2023: '계묘',
    2024: '갑진',
    2025: '을사',
    2026: '병오 (기준)',
    2027: '정미',
    2028: '무신',
    2029: '기유',
    2030: '경술',
    2031: '신해',
    2032: '임자',
  },
  wolwoon: {
    '01월': '기축',
    '02월': '경인',
    '03월': '신묘',
    '04월': '임진',
    '05월': '계사',
    '06월': '갑오',
    '07월': '을미',
    '08월': '병신',
    '09월': '정유',
    '10월': '무술',
    '11월': '기해',
    '12월': '경자',
  },
  daewoon: [
    { order: 1, pillar: '무진', startYear: 2001, ages: '2~11세' },
    { order: 2, pillar: '정묘', startYear: 2011, ages: '12~21세' },
    { order: 3, pillar: '병인', startYear: 2021, ages: '22~31세' },
    { order: 4, pillar: '을축', startYear: 2031, ages: '32~41세' },
    { order: 5, pillar: '갑자', startYear: 2041, ages: '42~51세' },
    { order: 6, pillar: '계해', startYear: 2051, ages: '52~61세' },
    { order: 7, pillar: '임술', startYear: 2061, ages: '62~71세' },
    { order: 8, pillar: '신유', startYear: 2071, ages: '72~81세' },
    { order: 9, pillar: '경신', startYear: 2081, ages: '82~91세' },
  ],
}

function calcKoreanAge(birthYear) {
  const year = Number(birthYear)
  if (!year) return null
  return new Date().getFullYear() - year
}

function formatSewoon(sewoon) {
  return Object.entries(sewoon)
    .map(([year, value]) => `${year}: ${value}`)
    .join('\n')
}

function formatWolwoon(wolwoon) {
  return Object.entries(wolwoon)
    .map(([month, value]) => `${month}: ${value}`)
    .join('\n')
}

function formatDaewoon(daewoon) {
  return daewoon
    .map(
      (item) =>
        `대운 ${item.order}: ${item.pillar} ${item.startYear} (${item.ages})`,
    )
    .join('\n')
}

/**
 * 사주 기본차트 해석 프롬프트 생성
 * @param {{ name?: string, gender: 'male'|'female', birthYear: string, birthMonth: string, birthDay: string, birthTime?: string, timeUnknown?: boolean, calendarType: 'solar'|'lunar' }} profile
 * @param {typeof SAMPLE_BASIC_CHART} [chart]
 */
export function buildBasicChartPrompt(profile, chart = SAMPLE_BASIC_CHART) {
  const age = calcKoreanAge(profile.birthYear)
  const genderLabel = profile.gender === 'female' ? 'female' : 'male'
  const calendarLabel = profile.calendarType === 'lunar' ? '음력' : '양력'
  const timeLabel = profile.timeUnknown
    ? '시간 모름'
    : profile.birthTime || '미입력'
  const nameLine = profile.name?.trim() ? `이름: ${profile.name.trim()}` : ''

  const { pillars, elements } = chart

  return `return only Korean.
당신은 세계 최고의 사주 해석 전문가다. 논리와 구조 중심으로 사주를 해석하며, 수천 명의 인생을 분석해 온 경험이 있다. 분석은 매우 냉정하고 직설적으로 진행되며, 감정에 휘둘리지 않는다.
그러나 의외로 인간 내면에 대한 깊은 통찰을 지니고 있고 장점과 단점을 냉정하게 말한다.
질문: 사주를 통해 이 사람의 전반적인 성격, 기질, 재능을 분석해 주세요.
사용자가 사주 용어에 익숙하지 않다고 가정하고, 쉽고 명확한 말로 설명하며 중요한 포인트에서는 핵심 사주 근거를 밝혀주세요.
1) 사주 명식을 바탕으로 차분하지만 흥미롭게 설명해 주세요.
2) 사주에서 특이하거나 눈에 띄는 점이 있으면 알려주세요.
3) 약점도 솔직하게 말해 주세요.
4) ⓿보이는 특징을 최소 한 가지 찾아 명확히 설명해 주세요.
5) 마지막은 사용자가 가장 궁금한 점을 묻는 질문으로 끝내주세요.
6) 판단 근거는 사용자가 제공한 모든 정보와 해석 가능한 모든 사주 정보를 종합해 제시해 주세요.
7) 긍정적 해석과 부정적 해석을 모두 고려해 주세요.
이외에도 특이한점 한가지를 찾아서 언급해 주세요.
${nameLine}
성별: ${genderLabel}
나이: 만 ${age ?? '알 수 없음'}세
입력 생년월일: ${calendarLabel} ${profile.birthYear}년 ${Number(profile.birthMonth)}월 ${Number(profile.birthDay)}일
태어난 시간: ${timeLabel}
년주는 ${pillars.year}, 월주는 ${pillars.month}, 일주는 ${pillars.day}, 시주는 ${pillars.hour}
오행 분포: 금${elements.metal} 목${elements.wood} 수${elements.water} 화${elements.fire} 토${elements.earth}
십신(천간): ${chart.tenGodsStem.join(' | ')}
십신(지지): ${chart.tenGodsBranch.join(' | ')}
지장간: ${chart.hiddenStems}
납음: ${chart.nayin.join(' | ')}
십이운성: ${chart.twelveStages.join(' | ')}
12신살: ${chart.twelveShinsa.join(' | ')}
旬/공망: [년]${chart.voids.year} [일]${chart.voids.day}
월령: ${chart.monthCommand}
대운수: ${chart.daewoonNumber}
세운:
${formatSewoon(chart.sewoon)}
월운:
${formatWolwoon(chart.wolwoon)}
${formatDaewoon(chart.daewoon)}
return only Korean.`
}
