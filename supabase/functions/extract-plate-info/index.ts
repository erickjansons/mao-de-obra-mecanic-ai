import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const today = new Date().toISOString().split('T')[0];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Você é um especialista em identificação de veículos brasileiros. Analise cuidadosamente esta imagem e extraia TODAS as informações disponíveis.

A imagem pode ser:
- Uma foto da placa do veículo
- Uma foto do veículo inteiro
- Um documento do veículo (CRLV, CRV, nota fiscal)
- Uma combinação dessas opções

EXTRAIA AS SEGUINTES INFORMAÇÕES:

1. **PLACA**: Identifique a placa do veículo (formato ABC-1234 ou ABC1D23 Mercosul). PRIORIDADE MÁXIMA.

2. **VEÍCULO**: Identifique MARCA + MODELO + ANO. 
   - Observe detalhes visuais do carro para determinar o modelo exato
   - Observe o design, faróis, grade, ano-modelo baseado no estilo
   - Se for um documento, leia o ano do modelo/fabricação
   - SEMPRE inclua o ano se conseguir identificar (ex: "Honda Civic 2020", "Fiat Uno 2015", "Chevrolet Onix 2019")
   - Se não conseguir determinar o ano exato, estime baseado no design do veículo

3. **CLIENTE/PROPRIETÁRIO**: Se a imagem for um documento (CRLV, CRV, etc.), extraia o nome do proprietário que aparece no documento.

Data de hoje: ${today}

REGRAS:
- Foque em extrair dados REAIS visíveis na imagem
- Para o veículo, SEMPRE tente incluir o ano - é muito importante
- Se for documento, leia o nome do proprietário
- Não invente informações que não estão visíveis
- Se não conseguir identificar um campo, retorne string vazia

RESPONDA APENAS com o JSON abaixo (sem markdown, sem explicações, sem crases):
{"placa": "ABC1234", "veiculo": "Marca Modelo Ano", "data_servico": "${today}", "cliente": "Nome do Proprietário"}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    console.log('AI Response:', content);

    // Parse the JSON response
    let extractedData = {
      placa: '',
      veiculo: '',
      data_servico: today,
      cliente: ''
    };

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedData = {
          placa: parsed.placa || '',
          veiculo: parsed.veiculo || '',
          data_servico: parsed.data_servico || today,
          cliente: parsed.cliente || ''
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Try to extract plate using regex as fallback
      const plateMatch = content.match(/[A-Z]{3}[-\s]?\d[A-Z0-9]\d{2}/i);
      if (plateMatch) {
        extractedData.placa = plateMatch[0].toUpperCase().replace(/[-\s]/g, '');
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao processar imagem' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
