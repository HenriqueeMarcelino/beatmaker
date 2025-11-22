# 🎵 BeatMaker - Web DAW

Sistema completo de produção musical web (Digital Audio Workstation) inspirado em **FL Studio**, **LMMS** e **Cakewalk by BandLab**.

![BeatMaker Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Recursos Principais

### 🎹 Produção Musical Completa
- **Timeline Multi-Track** - Organize seus áudios e instrumentos em múltiplas faixas
- **Piano Roll** - Editor MIDI visual para criar melodias e harmonias
- **Step Sequencer** - Sequenciador de batidas estilo drum machine
- **Mixer Profissional** - Controle volume, pan, mute e solo de cada track

### 🎛️ Efeitos de Áudio Profissionais
- **Reverb** - Adicione espacialização e ambiência
- **Delay** - Ecos e repetições criativas
- **EQ (3-Band)** - Equalização de baixas, médias e altas frequências
- **Compressor** - Controle dinâmico profissional
- **Distortion** - Saturação e distorção harmônica
- **Filter** - Filtros passa-baixa, passa-alta e passa-banda
- **Chorus** - Efeito de chorus para enriquecer o som
- **Phaser** - Modulação de fase para efeitos espaciais

### 🎚️ Ferramentas de Produção
- **Importação de Áudio** - Suporte para múltiplos formatos (WAV, MP3, OGG, etc.)
- **Drag & Drop Timeline** - Arraste e posicione clipes facilmente
- **Controle de Tempo** - Ajuste o BPM (40-240)
- **Zoom Variável** - Visualização detalhada ou panorâmica
- **Exportação WAV** - Exporte seus projetos em alta qualidade

## 🛠️ Tecnologias Utilizadas

### Core Audio
- **Web Audio API** - API nativa de áudio do navegador
- **Tone.js** - Framework profissional para síntese e processamento de áudio

### Frontend
- **React 18** - Framework UI moderno e reativo
- **TypeScript** - Tipagem estática para código robusto
- **Zustand** - Gerenciamento de estado leve e eficiente
- **Tailwind CSS** - Estilização utilitária e responsiva

### Build & Dev Tools
- **Vite** - Build tool ultra-rápido
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS

### Bibliotecas UI
- **Lucide React** - Ícones modernos
- **React Draggable** - Funcionalidade drag & drop
- **clsx** - Utilitário de classes CSS condicionais

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/beatmaker.git

# Entre no diretório
cd beatmaker

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🎮 Como Usar

### 1. Criar Tracks
- Clique em **"Audio Track"** para criar uma faixa de áudio
- Clique em **"Instrument"** para criar uma faixa de instrumento virtual

### 2. Importar Áudio
- Clique em **"Import Audio"** para carregar seus samples
- Arraste arquivos de áudio diretamente do seu computador
- Formatos suportados: WAV, MP3, OGG, FLAC, M4A

### 3. Timeline
- Arraste clipes horizontalmente para posicioná-los no tempo
- Clique em um clip para selecioná-lo
- Use o controle de zoom para visualização detalhada

### 4. Piano Roll
- Selecione um clip no timeline
- Mude para a visualização "Piano Roll"
- Clique nas células da grade para adicionar notas
- Arraste notas para ajustar pitch e posição

### 5. Step Sequencer
- Ideal para criar batidas e drums
- Clique nas células para ativar/desativar steps
- Use "Randomize" para gerar padrões aleatórios
- Use "Clear" para limpar o padrão

### 6. Mixer
- Ajuste o volume de cada track com os faders
- Use o controle de pan para posicionamento estéreo
- Ative "Mute" para silenciar uma track
- Ative "Solo" para ouvir apenas uma track

### 7. Efeitos
- Selecione uma track no mixer
- Clique no "+" para adicionar efeitos
- Ajuste os parâmetros de cada efeito
- Ative/desative efeitos individuais com o botão de power

### 8. Controles de Transporte
- **Play** - Inicia a reprodução
- **Pause** - Pausa a reprodução
- **Stop** - Para e volta ao início
- **BPM** - Ajusta o tempo do projeto

### 9. Exportação
- Clique em **"Export"** quando terminar
- O áudio será renderizado e baixado em formato WAV
- Qualidade de áudio profissional (44.1kHz, 16-bit)

## 🏗️ Arquitetura do Projeto

```
beatmaker/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Transport.tsx    # Controles play/pause/stop
│   │   ├── Toolbar.tsx      # Barra de ferramentas superior
│   │   ├── Timeline.tsx     # Timeline multi-track
│   │   ├── PianoRoll.tsx    # Editor MIDI
│   │   ├── StepSequencer.tsx # Sequenciador de steps
│   │   ├── TrackMixer.tsx   # Mixer de tracks
│   │   └── EffectsPanel.tsx # Painel de efeitos
│   │
│   ├── engine/              # Engine de áudio
│   │   └── AudioEngine.ts   # Core do sistema de áudio
│   │
│   ├── store/               # Gerenciamento de estado
│   │   └── useStore.ts      # Store Zustand
│   │
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
│
├── public/                  # Assets estáticos
├── package.json             # Dependências
├── vite.config.ts           # Configuração Vite
├── tsconfig.json            # Configuração TypeScript
└── tailwind.config.js       # Configuração Tailwind
```

## 🎯 Roadmap Futuro

- [ ] Sintetizadores virtuais (Synth, Bass, Lead)
- [ ] Automação de parâmetros
- [ ] Gravação de áudio via microfone
- [ ] Suporte a plugins VST (via WebAssembly)
- [ ] Salvamento e carregamento de projetos
- [ ] Undo/Redo
- [ ] Copiar/Colar clips
- [ ] Quantização MIDI
- [ ] Metrônomo visual e sonoro
- [ ] Temas de cores personalizados
- [ ] Atalhos de teclado
- [ ] Loop de regiões
- [ ] Marcadores e regiões
- [ ] Análise de espectro em tempo real

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fork o projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- **Tone.js** - Por fornecer um framework incrível para Web Audio
- **FL Studio, LMMS, Cakewalk** - Pela inspiração no design e funcionalidades
- **Web Audio API** - Por tornar áudio profissional possível no navegador

## 📧 Contato

Se você tiver dúvidas ou sugestões, sinta-se à vontade para abrir uma issue!

---

**Feito com ❤️ e muita música 🎵**
