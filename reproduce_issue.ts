
const parseAiMessage = (fullText: string) => {
  if (!fullText) return {};
  const extract = (regex: RegExp) => {
    const match = fullText.match(regex);
    return match ? match[1].trim() : null;
  };

  // Support for both standard and emoji-based formats
  return {
    executionId: extract(/(?:ID da Execução|Execution ID)[^\d]*(\d+)/i) || 'N/A',
    directLink: extract(/(?:Link direto|Link)[^\w]*(https?:\/\/[^\s]+)/i),
    failingNode: extract(/(?:Erro na Execução do Node|Último nó executado)[^\w"]*["']?([^"'\n]+)["']?/i) || 'Desconhecido',
    errorType: extract(/(?:Tipo de erro|Error Type)[^\w]*([^\n]+)/i) || 'Erro desconhecido',
    errorMessage: extract(/(?:Mensagem|Message)[^\w]*([^\n]+)/i) || 'Sem mensagem',
    suggestion: extract(/(?:Sugestão|Suggestion)[^\w]*([^\n]+)/i) || 'Sem sugestão',
    possibleCause: extract(/(?:Possível causa|Possible cause|Diagnóstico)[^\w]*([^\n]+)/i) || 'Desconhecida',
  };
};

const sampleText = `🔴 Erro na Execução do Node "HttpRequest"
📄 Nome do Workflow: Não informado diretamente (ID da execução fornecido)
🧩 ID da Execução: 17914
📍 Link direto: https://n8n-editor.nubuwf.easypanel.host/workflow/60zcs2wg7HNQiy3c/executions/17914
🗓️ Horário: Não especificado`;

console.log('Testing with sample text:');
console.log(JSON.stringify(parseAiMessage(sampleText), null, 2));
