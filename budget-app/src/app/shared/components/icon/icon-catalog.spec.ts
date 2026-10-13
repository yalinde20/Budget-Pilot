import { ICON_CATALOG, iconLabel, searchIcons } from './icon-catalog';
import { ICON_PATHS } from './icon-paths';

describe('catalogue d’icônes', () => {
  it('a un tracé SVG pour chaque icône, sans doublon', () => {
    const ids = ICON_CATALOG.map((icon) => icon.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(ICON_PATHS[id.replace(/^ti-/, '')]).withContext(id).toBeDefined();
    }
  });

  it('garde les 8 icônes des versions précédentes', () => {
    for (const id of ['ti-home', 'ti-salad', 'ti-pig-money', 'ti-ball-tennis', 'ti-car', 'ti-heart', 'ti-shopping-cart', 'ti-plane']) {
      expect(ICON_CATALOG.some((icon) => icon.id === id)).withContext(id).toBeTrue();
    }
  });
});

describe('searchIcons', () => {
  const ids = (q: string) => searchIcons(q).map((icon) => icon.id);

  it('cherche dans les libellés et les mots-clés', () => {
    expect(ids('loyer')).toEqual(['ti-home']);
    expect(ids('voiture')).toContain('ti-car');
    expect(ids('netflix')).toEqual(['ti-device-tv']);
  });

  it('ignore les accents et les majuscules', () => {
    expect(ids('ELECTRICITE')).toEqual(['ti-bolt']);
    expect(ids('électricité')).toEqual(['ti-bolt']);
    expect(ids('sante')).toEqual(ids('Santé'));
  });

  it('renvoie tout le catalogue pour une recherche vide, rien pour une recherche inconnue', () => {
    expect(searchIcons('  ').length).toBe(ICON_CATALOG.length);
    expect(searchIcons('xyzabc')).toEqual([]);
  });
});

describe('iconLabel', () => {
  it('donne le libellé, ou « Autre » pour une icône inconnue', () => {
    expect(iconLabel('ti-home')).toBe('Logement');
    expect(iconLabel('ti-inconnue')).toBe('Autre');
    expect(iconLabel(undefined)).toBe('Autre');
  });
});
