import { Building2, GraduationCap, MapPin, ExternalLink, Activity, Users, BookOpen } from 'lucide-react';
import React, { useMemo } from 'react';

export interface PhdLab {
  id: string;
  name: string;
  institution: string;
  location: string;
  type: 'Academic' | 'Industry' | 'Hybrid';
  status: 'Accepting Applications' | 'Closed' | 'Rolling' | 'Fall 2026 Cycle';
  focus: string;
  url: string;
  jobDescription: string;
  keyPIs: { name: string; scholarUrl: string }[];
}

const TOP_LABS: PhdLab[] = [
  { 
    id: '1', name: 'SAIL (Stanford AI Lab)', institution: 'Stanford University', location: 'Stanford, CA', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Foundational AI, Robotics, NLP, Vision', url: 'https://ai.stanford.edu/',
    jobDescription: 'Seeking highly motivated PhD candidates with strong mathematical foundations and experience in PyTorch. Our lab focuses on pushing the boundaries of Generative Models, Robotic manipulation, and Multi-modal Foundation Models. Candidates should ideally have publications in NeurIPS, ICLR, or CVPR.',
    keyPIs: [{ name: 'Fei-Fei Li', scholarUrl: 'https://scholar.google.com/citations?user=rDfyQnIAAAAJ' }, { name: 'Christopher Manning', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '2', name: 'BAIR (Berkeley AI Research)', institution: 'UC Berkeley', location: 'Berkeley, CA', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Deep Learning, Robotics, RL, CV', url: 'https://bair.berkeley.edu/',
    jobDescription: 'Looking for researchers passionate about Deep Reinforcement Learning, Autonomous Vehicles, and scalable Foundation Models. Strong coding skills in Python, CUDA, and PyTorch are essential. Prior track record in ICML or NeurIPS is highly desirable.',
    keyPIs: [{ name: 'Pieter Abbeel', scholarUrl: 'https://scholar.google.com/citations?user=vtwH6GkAAAAJ' }, { name: 'Sergey Levine', scholarUrl: 'https://scholar.google.com/citations?user=8R35rCwAAAAJ' }]
  },
  { 
    id: '3', name: 'CSAIL', institution: 'MIT', location: 'Cambridge, MA', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'AI Systems, Theory, Healthcare, ML', url: 'https://www.csail.mit.edu/',
    jobDescription: 'Seeking PhD students interested in the intersection of AI Systems, Machine Learning Theory, and robust Generative AI. We value interdisciplinary approaches involving Healthcare AI and large-scale distributed training mechanisms.',
    keyPIs: [{ name: 'Daniela Rus', scholarUrl: 'https://scholar.google.com/citations?user=1DpwIhcAAAAJ' }, { name: 'Antonio Torralba', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '4', name: 'Google DeepMind', institution: 'Alphabet', location: 'London / Remote', 
    type: 'Industry', status: 'Accepting Applications', focus: 'AGI, RL, Science, Core Models', url: 'https://deepmind.google/careers/',
    jobDescription: 'Join our Research Scientist residency to build AGI. We are looking for extraordinary track records in Reinforcement Learning, scaling Laws, Transformer architectures, and AI for Science (e.g. AlphaFold). Deep expertise in JAX or PyTorch at scale is required.',
    keyPIs: [{ name: 'Demis Hassabis', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }, { name: 'Oriol Vinyals', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '5', name: 'FAIR (Fundamental AI Research)', institution: 'Meta', location: 'Menlo Park / Paris', 
    type: 'Industry', status: 'Rolling', focus: 'Open ML, CV, NLP, Large Models', url: 'https://ai.meta.com/careers/',
    jobDescription: 'FAIR is advancing the state-of-the-art in open-source AI (Llama series). We need experts in Large Language Models (LLMs), Computer Vision (CV), and self-supervised learning. You should have top-tier vision or NLP publications (CVPR, ACL, EMNLP).',
    keyPIs: [{ name: 'Yann LeCun', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '6', name: 'OpenAI Residency', institution: 'OpenAI', location: 'San Francisco, CA', 
    type: 'Industry', status: 'Closed', focus: 'LLMs, Alignment, Multimodal AGI', url: 'https://openai.com/careers',
    jobDescription: 'The OpenAI Residency is for researchers switching into AI alignment and core capability research. Focus is on Post-Training, RLHF, Multimodal Foundation Models, and safety evaluations. Extensive coding and systems scaling experience is a major plus.',
    keyPIs: [{ name: 'Ilya Sutskever', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '7', name: 'Mila', institution: 'University of Montreal', location: 'Montreal, Canada', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Deep Learning, RL, AI for Good', url: 'https://mila.quebec/',
    jobDescription: 'Seeking PhD candidates dedicated to fundamental Deep Learning research, optimization theory, and Reinforcement Learning. We highly value open-source contributions and publications in NeurIPS and ICLR.',
    keyPIs: [{ name: 'Yoshua Bengio', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '8', name: 'MMLab', institution: 'CUHK', location: 'Hong Kong', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Computer Vision, Generative Models', url: 'http://mmlab.ie.cuhk.edu.hk/',
    jobDescription: 'MMLab is constantly looking for brilliant PhDs to work on cutting-edge Computer Vision, 3D Vision, and Generative Models. Solid math, PyTorch mastery, and ambition to publish in CVPR, ICCV, and ECCV are required.',
    keyPIs: [{ name: 'Xiaoou Tang', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }, { name: 'Chen Change Loy', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '9', name: 'HKUST Vision Lab', institution: 'HKUST', location: 'Hong Kong', 
    type: 'Academic', status: 'Rolling', focus: 'Robotics, 3D Vision, Autonomous Driving', url: 'https://vislab.cse.ust.hk/',
    jobDescription: 'Seeking highly motivated students for PhD programs. Emphasis on 3D Vision, SLAM, Autonomous Driving, and Machine Learning. Prior publications in ICRA, CVPR, or NeurIPS are welcome.',
    keyPIs: [{ name: 'Chi-Keung Tang', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '10', name: 'NExT++ Lab', institution: 'NUS', location: 'Singapore', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Multimedia, IR, LLM Agents', url: 'https://www.nextcenter.org/',
    jobDescription: 'Focus on Information Retrieval, Recommender Systems, Multimodal LLM Agents, and Trustworthy AI. We seek candidates with strong algorithmic backgrounds and potential for top-tier NLP and Web/IR publications (SIGIR, ACL).',
    keyPIs: [{ name: 'Tat-Seng Chua', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '11', name: 'S-Lab', institution: 'NTU', location: 'Singapore', 
    type: 'Academic', status: 'Accepting Applications', focus: 'Smart Cities, Vision, AI Systems', url: 'https://www.ntu.edu.sg/s-lab',
    jobDescription: 'Looking for PhD researchers to innovate in Computer Vision, Generative AI for content creation, and efficient AI systems. Strong programming skills in Python/C++ and familiarity with Generative Models (Diffusion, GANs).',
    keyPIs: [{ name: 'Chen Change Loy', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }, { name: 'Ziwei Liu', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '12', name: 'Vector Institute', institution: 'Univ. of Toronto', location: 'Toronto, Canada', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Deep Learning, ML Theory, Healthcare', url: 'https://vectorinstitute.ai/',
    jobDescription: 'Recruiting for Machine Learning, Generative AI, and AI in Healthcare. Collaborating closely with top hospitals and tech industry. Needs strong foundation in statistical learning theory and PyTorch.',
    keyPIs: [{ name: 'Geoffrey Hinton', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '13', name: 'OAT (Oxford Applied AI)', institution: 'Oxford University', location: 'Oxford, UK', 
    type: 'Academic', status: 'Fall 2026 Cycle', focus: 'Applied ML, Autonomous Systems, NLP', url: 'https://eng.ox.ac.uk/oat/',
    jobDescription: 'Seeking DPhil candidates for robust Machine Learning, Robotics, and interdisciplinary AI applications. Must have excellent analytical skills and experience with Foundation Models and Reinforcement Learning.',
    keyPIs: [{ name: 'Phil Blunsom', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '14', name: 'ETH AI Center', institution: 'ETH Zurich', location: 'Zurich, Switzerland', 
    type: 'Academic', status: 'Accepting Applications', focus: 'Robotics, Privacy, Core ML', url: 'https://ai.ethz.ch/',
    jobDescription: 'ETH AI Center offers a prestigious fellowship. Looking for broad expertise across AI safety, Privacy-preserving ML, Generative AI, and autonomous Robotics. Highly competitive, ICML/NeurIPS track record expected.',
    keyPIs: [{ name: 'Andreas Krause', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  },
  { 
    id: '15', name: 'Anthropic', institution: 'Anthropic', location: 'San Francisco, CA', 
    type: 'Industry', status: 'Accepting Applications', focus: 'Claude, AI Safety, Alignment', url: 'https://www.anthropic.com/careers',
    jobDescription: 'Hiring Research Scientists to build reliable, interpretability-focused, and steerable LLMs. Expertise in model evaluation, mechanistic interpretability, scaling laws, and frontier RLHF models (PyTorch) is crucial.',
    keyPIs: [{ name: 'Dario Amodei', scholarUrl: 'https://scholar.google.com/citations?user=1Z8YcwYAAAAJ' }]
  }
];

const STOP_WORDS = new Set(['the', 'and', 'for', 'in', 'to', 'of', 'with', 'on', 'a', 'is', 'are', 'we', 'our', 'an', 'or', 'as', 'at', 'be', 'by', 'from', 'this', 'that', 'it', 'such', 'very', 'highly', 'strong', 'looking', 'seeking', 'candidates', 'research', 'phd', 'experience']);

function extractKeywords(labs: PhdLab[]): { text: string, value: number }[] {
  const wordCount: Record<string, number> = {};
  
  labs.forEach(lab => {
    // Regex splits by non-word characters
    const words = lab.jobDescription.toLowerCase().split(/[\s,.;:()!]+/);
    words.forEach(word => {
      // Basic filtering: ignore short words, numbers, and stop words
      if (word.length > 2 && !STOP_WORDS.has(word) && isNaN(Number(word))) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30); // Top 30 keywords
}

export function PhdRecruitment() {
  const keywords = useMemo(() => extractKeywords(TOP_LABS), []);

  return (
    <div className="flex flex-col h-full bg-[#111] overflow-hidden">
      <div className="flex items-center gap-3 mb-6 text-[#00A19B] shrink-0 p-4 pb-0">
        <GraduationCap className="w-5 h-5" />
        <h1 className="text-xl font-mono uppercase tracking-[0.2em] font-light">Frontier Lab Intel & Global Opportunities</h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-4 pt-0 space-y-8">
        
        {/* Keyword Word Cloud Section */}
        <div className="border border-[#333] bg-[#0A0A0A] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#00A19B] opacity-[0.03] rotate-45 transform translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-4">
            <h2 className="text-[10px] font-mono tracking-widest text-[#888] uppercase">Global Algorithm Requirements (Aggregated JDs)</h2>
            <BookOpen className="w-4 h-4 text-[#00A19B] opacity-50" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center items-end min-h-[100px] content-center">
            {keywords.map((kw, i) => {
              // Scale size based on frequency
              const size = 10 + (kw.value * 2.5); // px
              const isTop = i < 5;
              return (
                <span 
                  key={kw.text} 
                  className={`font-mono transition-all hover:scale-110 cursor-default select-none
                    ${isTop ? 'text-[#00A19B] font-bold' : 'text-[#888]'}
                  `}
                  style={{ fontSize: `${size}px`, opacity: Math.max(0.4, 1 - (i * 0.02)) }}
                  title={`Frequency: ${kw.value}`}
                >
                  {kw.text}
                </span>
              );
            })}
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {TOP_LABS.map((lab) => {
            const isAcademic = lab.type === 'Academic';
            const isAccepting = lab.status === 'Accepting Applications' || lab.status === 'Rolling';
            const isClosed = lab.status === 'Closed';

            return (
              <div 
                key={lab.id} 
                className={`border bg-[#1a1a1a] transition-all p-5 group relative overflow-hidden flex flex-col h-full
                  border-[#333333] hover:border-[#00A19B] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,161,155,0.05)]
                `}
              >
                <div className="absolute inset-0 transition-opacity pointer-events-none opacity-[0.03] group-hover:opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00A19B 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#00A19B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="data-stream-effect mix-blend-screen hidden group-hover:block" />

                <div className="flex justify-between items-start mb-4 z-10 relative border-b border-[#333] pb-3">
                  <div className="pr-4">
                    <h2 className="text-lg text-[#E6E6E6] font-[500] leading-tight group-hover:text-[#00A19B] transition-colors flex items-center gap-2">
                      {isAcademic ? <GraduationCap className="w-4 h-4 shrink-0 text-[#888]" /> : <Building2 className="w-4 h-4 shrink-0 text-[#888]" />}
                      {lab.name}
                    </h2>
                    <div className="text-xs text-[#888] font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{lab.institution}</div>
                  </div>
                  <div className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest shrink-0 border
                    ${isAcademic ? 'bg-[#333] text-[#E6E6E6] border-[#444]' : 'bg-[#00A19B]/10 text-[#00A19B] border-[#00A19B]/30'}
                  `}>
                    {lab.type}
                  </div>
                </div>

                <div className="flex-1 space-y-4 z-10 relative mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${isAccepting ? 'text-[#00A19B]' : isClosed ? 'text-[#FF2800]' : 'text-[#FFD700]'}`} />
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-widest text-[#555]">Recruitment Status</div>
                        <div className={`font-mono text-[11px] ${isAccepting ? 'text-[#E6E6E6]' : isClosed ? 'text-[#888] line-through' : 'text-[#E6E6E6]'}`}>
                          {lab.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-widest text-[#555]">Location Hub</div>
                        <div className="text-[#ccc] text-[11px]">{lab.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* PI Roster */}
                  <div className="border border-[#222] bg-[#111] p-3 rounded-sm mt-3">
                    <div className="flex items-center gap-2 mb-2 text-[#555] border-b border-[#222] pb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-mono tracking-widest">Key Investigators (PI)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lab.keyPIs.map((pi, idx) => (
                        <a 
                          key={idx}
                          href={pi.scholarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-[#00A19B] hover:text-[#111] bg-[#00A19B]/10 hover:bg-[#00A19B] border border-[#00A19B]/30 px-2 py-1 transition-colors flex items-center gap-1"
                          title="View Google Scholar"
                        >
                          {pi.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#333] z-10 relative flex flex-col justify-between items-start gap-3">
                  <div className="text-[10px] text-[#888] uppercase tracking-wider line-clamp-2 leading-relaxed h-[32px] overflow-hidden" title={lab.focus}>
                    <span className="text-[#555] font-mono mr-1">R&D:</span> 
                    {lab.focus}
                  </div>
                  
                  <a 
                    href={lab.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full group/btn flex justify-center items-center gap-2 text-[10px] font-mono text-[#E6E6E6] border border-[#333] hover:border-[#00A19B] bg-[#222] hover:bg-[#00A19B]/10 px-3 py-2 uppercase tracking-widest transition-all mt-2"
                  >
                    <ExternalLink className="w-3 h-3 group-hover/btn:scale-110 transition-transform text-[#00A19B]" /> Access Portal
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
