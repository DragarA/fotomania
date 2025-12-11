import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-4">Fotomania</h3>
            <p className="text-sm">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">{t('footer.product.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.product.features')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.product.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.product.security')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-accent-600 transition-colors">
                  {t('footer.company.about')}
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.company.blog')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.company.careers')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.legal.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-600 transition-colors">
                  {t('footer.legal.cookiePolicy')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-center">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
