import { useState } from "#app";
import type { Ref } from "vue";

export interface BlockedDomain {
  id: string;
  domain: string;
  addedAt: number;
  enabled: boolean;
}

export interface UseBlockedDomainsReturn {
  blockedDomains: Ref<BlockedDomain[]>;
  addBlockedDomain: (domain: string) => BlockedDomain;
  removeBlockedDomain: (id: string) => void;
  toggleDomainStatus: (id: string) => void;
  isDomainBlocked: (url: string) => boolean;
  importBlocklist: (domains: string[]) => void;
  getBlockedDomainsCount: () => number;
}

/**
 * Composable para gerenciar domínios bloqueados
 */
export const useBlockedDomains = (): UseBlockedDomainsReturn => {
  // Estado dos domínios bloqueados com persistência
  const blockedDomains = useState<BlockedDomain[]>(
    "browser-blocked-domains",
    () => {
      // Inicialização com alguns bloqueadores comuns de anúncios
      const defaultDomains = [
        "ads.google.com",
        "adservice.google.com",
        "pagead2.googlesyndication.com",
        "googleadservices.com",
        "ad.doubleclick.net",
        "static.doubleclick.net",
        "www.googleadservices.com",
        "securepubads.g.doubleclick.net",
        "analytics.google.com",
        "google-analytics.com",
        "ssl.google-analytics.com",
        "www.google-analytics.com",
        "adwords.google.com",
        "tpc.googlesyndication.com",
      ];

      return defaultDomains.map((domain) => ({
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        domain,
        addedAt: Date.now(),
        enabled: true,
      }));
    }
  );

  /**
   * Adiciona um novo domínio à lista de bloqueados
   */
  const addBlockedDomain = (domain: string): BlockedDomain => {
    // Limpa e formata o domínio
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "") // Remove http:// ou https://
      .replace(/\/.*$/, ""); // Remove qualquer path após o domínio

    // Verifica se o domínio já existe
    const existingIndex = blockedDomains.value.findIndex(
      (item) => item.domain === cleanDomain
    );

    if (existingIndex >= 0) {
      // Se já existe, apenas ativa o domínio
      const updatedDomains = [...blockedDomains.value];
      updatedDomains[existingIndex].enabled = true;
      blockedDomains.value = updatedDomains;
      return updatedDomains[existingIndex];
    }

    // Cria um novo item bloqueado
    const newBlockedDomain: BlockedDomain = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      domain: cleanDomain,
      addedAt: Date.now(),
      enabled: true,
    };

    // Adiciona ao início da lista para ser mais visível
    blockedDomains.value = [newBlockedDomain, ...blockedDomains.value];

    return newBlockedDomain;
  };

  /**
   * Remove um domínio da lista de bloqueados
   */
  const removeBlockedDomain = (id: string): void => {
    blockedDomains.value = blockedDomains.value.filter(
      (item) => item.id !== id
    );
  };

  /**
   * Ativa/desativa um domínio bloqueado
   */
  const toggleDomainStatus = (id: string): void => {
    blockedDomains.value = blockedDomains.value.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
  };

  /**
   * Verifica se um URL deve ser bloqueado
   */
  const isDomainBlocked = (url: string): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      return blockedDomains.value
        .filter((item) => item.enabled) // Apenas domínios ativos
        .some((item) => {
          // Domínio exato ou subdomínio
          return (
            hostname === item.domain || hostname.endsWith(`.${item.domain}`)
          );
        });
    } catch (error) {
      console.error("Erro ao verificar domínio bloqueado:", error);
      return false;
    }
  };

  /**
   * Importa uma lista de domínios
   */
  const importBlocklist = (domains: string[]): void => {
    // Adiciona cada domínio da lista
    const newDomains = domains.map((domain) => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      domain: domain.trim().toLowerCase(),
      addedAt: Date.now(),
      enabled: true,
    }));

    // Filtra domínios que já existem
    const existingDomains = new Set(
      blockedDomains.value.map((item) => item.domain)
    );
    const uniqueNewDomains = newDomains.filter(
      (item) => !existingDomains.has(item.domain)
    );

    // Atualiza a lista
    blockedDomains.value = [...uniqueNewDomains, ...blockedDomains.value];
  };

  /**
   * Retorna o total de domínios ativos
   */
  const getBlockedDomainsCount = (): number => {
    return blockedDomains.value.filter((item) => item.enabled).length;
  };

  return {
    blockedDomains,
    addBlockedDomain,
    removeBlockedDomain,
    toggleDomainStatus,
    isDomainBlocked,
    importBlocklist,
    getBlockedDomainsCount,
  };
};
