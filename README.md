# Mutirões - Plataforma de Apoio a Ações Comunitárias

Uma plataforma para organização e participação em mutirões e ações ambientais comunitárias.

## 🎯 Objetivo

Facilitar a organização de eventos de limpeza, plantio e monitoramento cidadão, conectando pessoas que compartilham a paixão por um mundo mais sustentável.

## 🏗️ Arquitetura

### Backend (Django/DRF)

- **API RESTful** completa com autenticação JWT
- **Banco de dados** SQLite (desenvolvimento) / PostgreSQL (produção)
- **Sistema de tarefas assíncronas** com Celery + Redis
- **Gestão de eventos, participantes e recursos**
- **Sistema de relatórios de impacto**

### Frontend (Next.js/React)

- **Design System** baseado no Apple Human Interface Guidelines
- **Interface responsiva** com Tailwind CSS
- **Componentes reutilizáveis** seguindo padrões modernos
- **Geolocalização** para eventos próximos via API nativa do navegador

## 🚀 Funcionalidades

### Para Organizadores

- ✅ Criação e gestão de eventos
- ✅ Controle de participantes e recursos
- ✅ Relatórios de impacto ambiental
- ✅ Sistema de check-in para presença

### Para Voluntários

- ✅ Descoberta de eventos próximos
- ✅ Inscrição em eventos
- ✅ Histórico de participação
- ✅ Compartilhamento de fotos dos eventos
- ✅ Comentários em eventos

### Para a Comunidade

- ✅ Feed de atividades e eventos
- ✅ Cálculo de impacto ambiental (lixo coletado, árvores plantadas, área limpa)
- ✅ Sistema de categorias (Limpeza, Plantio, Monitoramento, Educação)

## 🛠️ Tecnologias

### Backend

- Django 4.2.7
- Django REST Framework
- JWT Authentication
- Celery (tasks assíncronas)
- Redis (cache e broker)
- Firebase Admin SDK
- PostGIS (geoprocessamento)

### Frontend

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Heroicons
- Framer Motion
- React Hook Form

## 📁 Estrutura do Projeto

```
lastaps/
├── mutiroes_backend/          # Backend Django
│   ├── events/                # App de eventos
│   ├── users/                 # App de usuários
│   ├── notifications/         # App de notificações
│   └── geoprocessing/         # App de geoprocessamento
├── mutiroes-frontend/         # Frontend Next.js
│   ├── src/
│   │   ├── app/              # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   └── lib/              # Utilitários
└── README.md
```

## 🎨 Design System

O frontend segue rigorosamente o **Apple Human Interface Guidelines**:

### Cores

- **Primary Blue**: #3b82f6 (Apple Blue)
- **Success Green**: #22c55e (Apple Green)
- **Warning Orange**: #f97316 (Apple Orange)
- **Error Red**: #ef4444 (Apple Red)

### Tipografia

- **Fonte Principal**: SF Pro Display/Text
- **Escala**: Large Title, Title 1-3, Headline, Body, Callout, etc.

### Componentes

- **Botões**: Seguindo padrões de interação da Apple
- **Cards**: Bordas arredondadas e sombras suaves
- **Navegação**: Tab bar e navigation bar estilo iOS
- **Animações**: Transições suaves e naturais

## 🚀 Como Executar

### Backend

```bash
cd mutiroes_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd mutiroes-frontend
npm install
npm run dev
```

## 📱 Funcionalidades Mobile

- **Design responsivo** para todos os dispositivos
- **Geolocalização** para encontrar eventos próximos
- **Notificações push** para lembretes de eventos
- **Check-in** com GPS para validação de presença
- **Câmera integrada** para fotos antes/depois

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)

```env
SECRET_KEY=your-secret-key
DEBUG=True
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
FIREBASE_PROJECT_ID=your-project-id
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

## 📊 Métricas e Impacto

A plataforma rastreia:

- **Eventos realizados** e participantes
- **Horas voluntariadas** por usuário
- **Impacto ambiental** (lixo coletado, árvores plantadas)
- **CO2 reduzido** através das ações
- **Engajamento** da comunidade

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Equipe Mutirões
- **Design**: Baseado no Apple Human Interface Guidelines
- **Backend**: Django/DRF
- **Frontend**: Next.js/React

## 📞 Contato

- **Email**: contato@mutiroes.com.br
- **Website**: https://mutiroes.com.br
- **GitHub**: https://github.com/mutiroes

---

**Mutirões** - Conectando pessoas para um mundo mais sustentável 🌱


