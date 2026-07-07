import { GoogleGenAI } from "@google/genai";
import { FreelancerProject } from "../freelancer/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const USER_PROFILE = `Systems Engineer y Junior DBA con fuerte perfil full-stack, basado en Santo Domingo, Republica Dominicana.
- Stack backend/DBA: SQL Server, Dynamics GP (SSRS, VBA/Modifier, stored procedures), administracion de bases de datos, compliance fiscal DGII (NCF/ECF) para RD.
- Stack dev: React, Next.js, Node.js, MongoDB.`;

export async function generateProposalDraft(project: FreelancerProject): Promise<string> {
  const interaction = await ai.interactions.create({
    model: "gemini-2.5-flash-lite",
    system_instruction: `Eres un asistente que redacta borradores de propuestas para proyectos de Freelancer.com. El freelancer revisa y edita antes de enviar, asi que el tono debe ser profesional, directo y en español, sin relleno. Usa el perfil del freelancer para resaltar el match con el proyecto.

Perfil del freelancer:
${USER_PROFILE}`,
    input: `Redacta un borrador de propuesta (3-5 parrafos cortos) para este proyecto de Freelancer.com:

Titulo: ${project.title}

Descripcion:
${project.description}

Presupuesto: ${project.budget.minimum}-${project.budget.maximum ?? "?"} ${project.currency.code} (${project.type})`,
  });

  return interaction.output_text ?? "";
}
