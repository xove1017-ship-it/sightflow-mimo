export function createProvider(context) {
  const config = context.providerConfig

  return {
    async *run(input) {
      yield { type: 'thinking', content: '小米 Mimo 分析中...' }

      try {
        const baseUrl = config.baseUrl || 'https://api.xiaomimimo.com/v1'
        const model = config.model || 'mimo-v2.5'
        const systemPrompt = '你是一个聊天助手，根据截图中的聊天内容生成自然的回复。请只输出回复内容，不要添加额外说明。如果不需要回复，请输出 [SKIP]。'

        const messages = [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: input.screenshot
                }
              },
              {
                type: 'text',
                text: `当前应用: ${input.appType}${input.currentContact ? '\n当前联系人: ' + input.currentContact : ''}${input.ocrText ? '\nOCR文本: ' + input.ocrText : ''}\n\n请根据截图内容判断是否需要回复。如果需要回复，直接输出回复内容；如果不需要回复（比如最后一条是自己发的、系统消息等），输出 [SKIP]。`
              }
            ]
          }
        ]

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': config.apiKey
          },
          body: JSON.stringify({
            model,
            messages,
            max_completion_tokens: 1024
          })
        })

        if (!response.ok) {
          const errText = await response.text()
          yield { type: 'error', error: `API 请求失败 (${response.status}): ${errText}` }
          return
        }

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content?.trim()

        if (!reply || reply === '[SKIP]' || reply.includes('[SKIP]')) {
          yield { type: 'skip' }
          return
        }

        yield { type: 'reply_text', content: reply }
      } catch (err) {
        yield { type: 'error', error: err.message }
      }
    }
  }
}
