import { Service } from '@/types/service';

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Não informada';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2)}`;
};

export const generateServicePDF = (service: Service) => {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ordem de Serviço - ${service.cliente}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      background: #fff;
      color: #1a1a2e;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 { 
      color: #3b82f6; 
      font-size: 28px; 
      margin-bottom: 5px;
    }
    .header p { color: #666; font-size: 14px; }
    .section { 
      margin-bottom: 25px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .section h3 { 
      color: #3b82f6; 
      margin-bottom: 15px; 
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      padding: 10px 0; 
      border-bottom: 1px solid #e2e8f0;
    }
    .row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #475569; }
    .value { color: #1e293b; }
    .total { 
      text-align: right; 
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      border-radius: 8px;
    }
    .total h2 { font-size: 24px; }
    .status { 
      display: inline-block; 
      padding: 6px 16px; 
      border-radius: 20px; 
      font-size: 12px; 
      font-weight: 600;
    }
    .status-concluido { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e40; }
    .status-andamento { background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b40; }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔧 Ordem de Serviço</h1>
    <p>Oficina Mecânica - Gerenciador de Mão de Obra</p>
  </div>
  
  <div class="section">
    <h3>👤 Dados do Cliente</h3>
    <div class="row">
      <span class="label">Cliente:</span>
      <span class="value">${service.cliente || 'Não informado'}</span>
    </div>
    <div class="row">
      <span class="label">Veículo:</span>
      <span class="value">${service.veiculo || 'Não informado'}</span>
    </div>
    <div class="row">
      <span class="label">Placa:</span>
      <span class="value">${service.placa || 'Não informada'}</span>
    </div>
  </div>
  
  <div class="section">
    <h3>🛠️ Detalhes do Serviço</h3>
    <div class="row">
      <span class="label">Serviço:</span>
      <span class="value">${service.servico || 'Não informado'}</span>
    </div>
    <div class="row">
      <span class="label">Data:</span>
      <span class="value">${formatDate(service.data_servico)}</span>
    </div>
    <div class="row">
      <span class="label">Status:</span>
      <span class="value">
        <span class="status ${service.status === 'Concluído' ? 'status-concluido' : 'status-andamento'}">
          ${service.status}
        </span>
      </span>
    </div>
  </div>
  
  <div class="total">
    <p style="margin-bottom: 5px; opacity: 0.9;">Valor da Mão de Obra</p>
    <h2>${formatCurrency(service.valor_mao_obra)}</h2>
  </div>
  
  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const shareOnWhatsApp = (service: Service, phoneNumber?: string) => {
  const message = `
🔧 *ORDEM DE SERVIÇO*
━━━━━━━━━━━━━━━━━━

👤 *Cliente:* ${service.cliente || 'Não informado'}
🚗 *Veículo:* ${service.veiculo || 'Não informado'}
🔢 *Placa:* ${service.placa || 'Não informada'}

🛠️ *Serviço:* ${service.servico || 'Não informado'}
📅 *Data:* ${formatDate(service.data_servico)}
📊 *Status:* ${service.status}

💰 *Valor:* ${formatCurrency(service.valor_mao_obra)}

━━━━━━━━━━━━━━━━━━
_Oficina Mecânica_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phoneNumber 
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};
