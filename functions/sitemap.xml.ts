import { getDb } from './_lib/db';
import type { Env } from './_lib/types';

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env } = context;
    const db = getDb(env);

    try {
        // Fetch English projects data
        const result = await db.execute({
            sql: "SELECT data FROM site_content WHERE section = 'projects' AND lang = 'en'"
        });

        let projects: any[] = [];
        if (result.rows.length > 0) {
            const data = JSON.parse(result.rows[0].data as string);
            projects = Array.isArray(data?.items) ? data.items : [];
        }

        const baseUrl = 'https://orbitsaas.cloud';

        // Static routes
        const staticRoutes = [
            '',
            '/#services',
            '/#tech-stack',
            '/#why-us',
            '/#projects',
            '/#leadership',
            '/#contact'
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        const today = new Date().toISOString().split('T')[0];

        // Add static routes
        for (const route of staticRoutes) {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${route}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Add dynamic project routes
        projects.forEach((proj: any, index: number) => {
            const id = proj.id || String(index);
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/project/${encodeURIComponent(id)}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
};
