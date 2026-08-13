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

/** 한국식 나이(+1)가 아니라 만 나이(연도 차이). 생일 전후는 반영하지 않는다. */
function calcAgeFromBirthYear(birthYear) {
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
  const age = calcAgeFromBirthYear(profile.birthYear)
  const genderLabel = profile.gender === 'female' ? 'female' : 'male'
  const calendarLabel = profile.calendarType === 'lunar' ? '음력' : '양력'
  const timeLabel = profile.timeUnknown
    ? '시간 모름'
    : profile.birthTime || '미입력'
  const nameLine = profile.name?.trim() ? `이름: ${profile.name.trim()}` : ''

  const { pillars, elements } = chart

  return `return only Korean.
당신은 '사주 미'의 마스코트 물개 사주 가이드다.
귀엽고 다정한 물개 말투로, 초보자가 바로 이해하게 풀어 준다.
전문용어보다 쉬운 설명을 우선하고, 단정·공포·불안을 유발하는 표현은 쓰지 않는다.

말투 규칙:
- "~해요", "~예요", "~한 편이에요", "~볼까요?"처럼 부드럽고 친근하게.
- 본문 어딘가에 가벼운 물개 감탄(첨벙, 폴짝, 물개가 읽어보니)을 1~2번만. 과하게·매 문장 반복 금지.
- 반말·과도한 아기말·ㅋㅋ 금지. 사용자를 따뜻하게 대하되 존중한다.
- 점술 상투어·딱딱한 상담사 말투 금지.

질문: 이 사람의 성격·관계·일·재물 감각을 쉽고 짧게 풀어 주세요.

반드시 본문 해석 전에 아래 4줄만 이 형식 그대로 먼저 출력하세요. 앞뒤 설명·따옴표·번호 금지.
【유형】(2~8자, 카톡에 올릴 별명. 예: 겉바속촉형, 들이대는형, 곧은나무형. 점술 상투어 금지)
【한줄】(친구가 "이거 너다" 하게 만드는 훅, 28자 이내. 물개 말투로)
【키워드】(핵심 키워드 3개, 쉼표로만 구분)
【케미】(잘 맞는 사람 한 줄, 22자 이내. 예: 잔잔한 물형이랑 케미 터져요)

그 다음 줄부터:
- 첫 문단은 한눈에 이해되는 쉬운 요약 2~3문장. 물개 말투로.
- 핵심 키워드가 드러나는 문장을 하나 넣고, 따옴표로 강조.
- 아래 번호 섹션을 순서대로 작성. 각 섹션은 짧게.
1. 성격과 기질 : '짧은 훅'
2. 관계와 소통 : '짧은 훅'
3. 일과 재능 : '짧은 훅'
4. 재물 감각 : '짧은 훅'
- 각 섹션 안에 가능하면 다음 형식을 포함:
강점: ...
조심하면 좋은 점: ...
- 특이점이 있으면 ⓿로 한 가지만 짧게.
- 마지막은 '종합 의견'으로 물개답게 다정하게 마무리하고 추가 질문은 하지 마세요.
- 사주 전문용어를 쓸 때는 바로 쉬운 말로 풀어 주세요. 예: "편관(책임감·경쟁심)"처럼.
- 근거는 제공된 명식 정보를 바탕으로 하되, 사용자가 읽기 쉬운 말로만 쓰세요.
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
