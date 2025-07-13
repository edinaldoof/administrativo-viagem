
'use server';
/**
 * @fileOverview Flow para padronizar nomes de locais para uso em APIs de mapas.
 *
 * - standardizeLocationName - Converte uma entrada de local (ex: "SSA", "Congonhas") em um nome completo e formal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StandardizeLocationInputSchema = z.string();
const StandardizeLocationOutputSchema = z.string();

export async function standardizeLocationName(location) {
    return standardizeLocationFlow(location);
}

const prompt = ai.definePrompt({
    name: 'standardizeLocationPrompt',
    input: { schema: StandardizeLocationInputSchema },
    output: { schema: StandardizeLocationOutputSchema },
    prompt: `Sua tarefa é converter uma entrada de local (que pode ser uma cidade, aeroporto, sigla de aeroporto ou ponto de referência) em um nome completo e padronizado, ideal para ser usado em uma API de mapas como o Google Maps. Forneça o nome mais específico possível, incluindo cidade, estado e país se aplicável.

Exemplos:
- Entrada: "SSA" -> Saída: "Aeroporto Internacional de Salvador - Dep. Luís Eduardo Magalhães, BA, Brasil"
- Entrada: "Congonhas" -> Saída: "Aeroporto de São Paulo/Congonhas, São Paulo, Brasil"
- Entrada: "Rio" -> Saída: "Rio de Janeiro, RJ, Brasil"
- Entrada: "NYC" -> Saída: "New York, NY, USA"

Entrada do Usuário: "{{input}}"
Nome Padronizado:`,
});

const standardizeLocationFlow = ai.defineFlow(
    {
        name: 'standardizeLocationFlow',
        inputSchema: StandardizeLocationInputSchema,
        outputSchema: StandardizeLocationOutputSchema,
    },
    async (location) => {
        try {
            const { output } = await prompt(location);
            return output || location; // Retorna o original em caso de falha da IA
        } catch (error) {
            console.error("Error in standardizeLocationFlow, returning original location:", error);
            return location; // Em caso de erro, retorna o valor original para não quebrar o fluxo
        }
    }
);
