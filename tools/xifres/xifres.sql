-- «ESSTrapis en xifres»: recomptes per any d'un tenant (una fila: mètrica, any, valor).
-- L'executa actualitza-xifres.sh a cada base de dades <tenant>_v5 del VPS.
-- Totes les files compten: les dades migrades de la v3 no tenen published_at
-- i no hi ha esborranys duplicats (una fila per document_id).
select 'projects', coalesce(year(date_start), year(created_at)), count(distinct document_id) from projects where coalesce(trashed,0)=0 group by 2
union all select 'hours_entries', year(date), count(*) from activities group by 2
union all select 'hours', year(date), round(sum(hours)) from activities group by 2
union all select 'emitted_invoices', year(emitted), count(*) from emitted_invoices group by 2
union all select 'invoiced_base', year(emitted), round(sum(total_base)) from emitted_invoices group by 2
union all select 'received_invoices', year(emitted), count(*) from received_invoices group by 2
union all select 'orders', year(route_date), count(*) from orders group by 2
union all select 'tasks', year(created_at), count(*) from tasks group by 2
union all select 'contacts', 0, count(*) from contacts
union all select 'users', 0, count(*) from `users-permissions_user` where coalesce(blocked,0)=0 and coalesce(hidden,0)=0;
