import { BlogTopic } from "./BlogTopic";
import { YouTubeVideoInterface } from "./YouTubeVideoInterface";

// YouTube video links
export const youtubeVideos: YouTubeVideoInterface[] = [
  {
    id: "1",
    title: "Canal ABE - Falando de epilepsia",
    thumbnail:
      "https://yt3.googleusercontent.com/ytc/AIdro_nYsIUUaPo4HzQcdTFSKxahAkvXBZ-QEB1oNHAu4X--Xi8=s160-c-k-c0x00ffffff-no-rj",
    url: "https://www.youtube.com/@CanalABE",
  },
  {
    id: "2",
    title: "Conversando sobre saúde",
    thumbnail:
      "https://yt3.googleusercontent.com/ytc/AIdro_mGkuGU0IJXMF2WCeq2HiACvoTMklsAUGFqSVm8_lLGCg=s160-c-k-c0x00ffffff-no-rj",
    url: "https://www.youtube.com/c/Conversandosobresa%C3%BAde",
  },
  {
    id: "3",
    title: "Dra. Luciana Midori",
    thumbnail:
      "https://yt3.googleusercontent.com/Hbw8ai4umFmX54cxnh-MNQFhvDlzdiJ_Oww86Vwgt7RRX7udlda3qh_HAYJEZNki2YQQSB6Rmw0=s160-c-k-c0x00ffffff-no-rj",
    url: "https://www.youtube.com/@dra.lumidori",
  },
  {
    id: "4",
    title: "Dieta Cetogênica Receitas",
    thumbnail: require("@/assets/images/abacate.png"),
    url: "https://www.youtube.com/results?search_query=dieta+cetog%C3%AAnica+receitas",
  },
  {
    id: "5",
    title: "Liga Brasileira de Epilepsia (LBE)",
    thumbnail: "",
    url: "https://www.epilepsia.org.br/",
  },
  {
    id: "6",
    title: "Associação Brasileira de Epilepsia (ABE)",
    thumbnail: "",
    url: "http://www.epilepsiabrasil.org.br",
  },
];

//Data for Blog Topics
export const blogTopics: BlogTopic[] = [
  {
    id: "1",
    title: "Epilepsia e Dietas",
    description: ` A Medicina moderna torna cada vez mais evidente a importância de estratégias terapêuticas complementares no manejo da epilepsia. As opções dietéticas, têm ganhado destaque como métodos coadjuvantes no tratamento desta complexa condição neurológica. Estas abordagens representam não apenas alternativas para pacientes com resistência a medicamentos antiepilépticos, mas também estratégias para mitigar efeitos adversos e melhorar a qualidade de vida.
<br><br>Abaixo sugerimos alguns canais de profissionais médicos e nutricionistas que tratam sobre o tema. Estes vídeos encontram-se livremente no canal do Youtube e você pode ampliar seus conhecimentos com eles e muitos outros.
<br><br>OBS: A opinião dos vídeos não refletem obrigatoriamente a opinião dos editores
`,
    thumbnail: require("@/assets/images/nuts.png"), // Replace with actual images
    videos: [
      youtubeVideos[0],
      youtubeVideos[1],
      youtubeVideos[2],
      youtubeVideos[3],
    ],
  },
  {
    id: "2",
    title: "Epilepsia: Entendendo a Condição",
    description: `A epilepsia é uma condição neurológica crônica caracterizada por crises epilépticas recorrentes, que são episódios de atividade elétrica anormal no cérebro. Esses episódios podem variar amplamente em termos de gravidade e manifestações, desde breves lapsos de atenção até convulsões prolongadas com perda de consciência. 
    <br><br><b>Causas e Fatores de Risco</b>
    <br><br>A epilepsia pode ser causada por uma variedade de fatores, incluindo genética, lesões cerebrais, infecções do sistema nervoso central, abuso de substâncias, e distúrbios metabólicos. Em muitos casos, a causa exata permanece desconhecida.
    <br><br>Alguns fatores de risco adicionais incluem idade, com incidência mais alta em crianças e idosos, histórico familiar de epilepsia, e doenças vasculares. Além disso, condições como Alzheimer e outras doenças neurodegenerativas podem aumentar o risco de desenvolver epilepsia na terceira idade.
    <br><br><b>Sintomas</b>
    <br><br>Os sintomas da epilepsia podem variar dependendo do tipo de crise. As crises focais (ou parciais) ocorrem quando a atividade elétrica anormal começa em uma área específica do cérebro, e podem ser simples, sem perda de consciência, ou complexas, com alteração da consciência. Já as crises generalizadas envolvem todo o cérebro e podem resultar em perda de consciência, contrações musculares, quedas, e espasmos.
    <br><br><b>Diagnóstico</b>
    <br><br>O diagnóstico da epilepsia geralmente envolve uma combinação de exames clínicos e testes laboratoriais. O histórico médico completo do paciente é essencial, assim como uma descrição detalhada das crises e exames.
    <br><br><b>Tratamento</b>
    <br><br>Embora a epilepsia não tenha cura, muitos pacientes conseguem controlar suas crises com medicação. Os medicamentos anticonvulsivantes são a primeira linha de tratamento e podem ser eficazes para a maioria das pessoas. Em casos onde a medicação não é eficaz, outras opções de tratamento incluem cirurgia, estimulação do nervo vago, e dieta cetogênica, que pode ser particularmente útil em crianças.
    <br><br>Aqui estão links de sites educativos que podem fornecer mais informações sobre epilepsia:
    `,
    thumbnail: require("@/assets/images/brain.png"),
    videos: [youtubeVideos[4], youtubeVideos[5]],
  },
];
