import type { APIRoute } from 'astro';
import { Client } from '@notionhq/client';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Parse request body
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { company, name, email, message, phone, services } = body as {
    company: string;
    name: string;
    email: string;
    message: string;
    phone?: string;
    services?: string;
  };

  // Validation
  if (!company || !name || !email || !message) {
    return new Response(JSON.stringify({ error: '必須項目が不足しています' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const errors: string[] = [];

  // 1. Save to Notion
  try {
    const notion = new Client({ auth: import.meta.env.NOTION_API_KEY });
    await notion.pages.create({
      parent: { database_id: import.meta.env.NOTION_DATABASE_ID },
      properties: {
        '会社名': {
          title: [{ text: { content: company } }],
        },
        '担当者名': {
          rich_text: [{ text: { content: name } }],
        },
        'メールアドレス': {
          email: email,
        },
        'お問い合わせ内容': {
          rich_text: [{ text: { content: message } }],
        },
        '受信日': {
          date: { start: new Date().toISOString() },
        },
        'ステータス': {
          select: { name: '未対応' },
        },
      },
    });
  } catch (e) {
    console.error('Notion error:', e);
    errors.push('Notion保存に失敗しました');
  }

  // 2. Send Gmail notification
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    const servicesText = services ? `ご関心のあるサービス: ${services}\n` : '';
    const phoneText = phone ? `電話番号: ${phone}\n` : '';

    await transporter.sendMail({
      from: `"言霊.studio" <${import.meta.env.GMAIL_USER}>`,
      to: import.meta.env.CONTACT_TO_EMAIL,
      subject: `【言霊.studio】新しいお問い合わせ: ${company}`,
      text: `
新しいお問い合わせが届きました。

━━━━━━━━━━━━━━━━━━━━━━
会社名・団体名: ${company}
担当者名: ${name}
メールアドレス: ${email}
${phoneText}${servicesText}
━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ内容】
${message}

━━━━━━━━━━━━━━━━━━━━━━
受信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      `.trim(),
    });
  } catch (e) {
    console.error('Gmail error:', e);
    errors.push('メール送信に失敗しました');
  }

  // Return response
  if (errors.length === 2) {
    // Both failed - return error
    return new Response(JSON.stringify({ error: errors.join(', ') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, warnings: errors.length > 0 ? errors : undefined }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
