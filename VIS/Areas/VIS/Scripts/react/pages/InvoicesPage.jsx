import React, { useState } from 'react';

const INVOICES = [
    { id: 'INV-1042', customer: 'Northwind Logistics', due: 'Today',   status: 'overdue',  amount: 12400 },
    { id: 'INV-1041', customer: 'Ember RetailCo',      due: 'Apr 20',  status: 'due_soon', amount: 8200  },
    { id: 'INV-1040', customer: 'Harbor Medical',      due: 'Apr 24',  status: 'sent',     amount: 6100  },
    { id: 'INV-1039', customer: 'Aerial Robotics',     due: 'Apr 26',  status: 'draft',    amount: 4400  },
    { id: 'INV-1038', customer: 'Brick+Mortar Inc.',   due: 'May 02',  status: 'approved', amount: 9800  },
];

const STATUS_CONFIG = {
    overdue:  { label: 'Overdue 3d', bg: '#FFE8E8', color: '#C0392B' },
    due_soon: { label: 'Due soon',   bg: '#FFF3CD', color: '#9A6500' },
    sent:     { label: 'Sent',       bg: '#DFF1FF', color: '#0E5DA8' },
    draft:    { label: 'Draft',      bg: '#EDEDED', color: '#505050' },
    approved: { label: 'Approved',   bg: '#CCEFDD', color: '#0C5D38' },
};

const fmt = (n) => '$' + n.toLocaleString('en-US');

const StatusChip = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    return (
        <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: cfg.bg,
            color: cfg.color,
            whiteSpace: 'nowrap',
        }}>
            {cfg.label}
        </span>
    );
};

const InvoicesPage = (props) => {
    const [selected, setSelected]       = useState([]);
    const [alertDismissed, setAlert]    = useState(false);

    const toggleRow = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const allChecked   = selected.length === INVOICES.length;
    const toggleAll    = () => setSelected(allChecked ? [] : INVOICES.map(i => i.id));

    return (
        <div style={{
            fontFamily: 'Roboto, sans-serif',
            padding: '24px',
            maxWidth: 760,
        }}>
            {/* Widget card */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.58) 100%)',
                border: '2px solid #FFFFFF',
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(15,61,97,0.06)',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px 14px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Invoice icon */}
                        <div style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            background: '#EAF8FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="#0083DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#102C3F' }}>
                            Invoices needing your attention
                        </span>
                    </div>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#0083DA',
                        padding: '4px 0',
                    }}>
                        + New invoice
                    </button>
                </div>

                {/* Duplicate alert */}
                {!alertDismissed && (
                    <div style={{
                        margin: '0 16px 12px',
                        background: '#FFF8E6',
                        border: '1px solid #F5C94E',
                        borderRadius: 10,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                    }}>
                        {/* Flag icon */}
                        <svg style={{ flexShrink: 0, marginTop: 2 }} width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="#D78B10" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                            <line x1="4" y1="22" x2="4" y2="15"/>
                        </svg>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4F00', marginBottom: 2 }}>
                                Duplicate suspected: INV-1042 matches INV-1029 amount + customer
                            </div>
                            <div style={{ fontSize: 12, color: '#9A6500' }}>
                                Same customer, same $12,400 amount, issued 6 days apart
                            </div>
                        </div>
                        <button
                            onClick={() => setAlert(true)}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E4C87A',
                                borderRadius: 6,
                                padding: '4px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#7A4F00',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                alignSelf: 'center',
                            }}>
                            Review
                        </button>
                    </div>
                )}

                {/* Table */}
                <div style={{ padding: '0 4px 4px' }}>
                    {/* Table header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '36px 1fr 1.4fr 100px 140px 110px',
                        alignItems: 'center',
                        padding: '6px 16px',
                        borderBottom: '1px solid #EDF2F6',
                    }}>
                        <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={toggleAll}
                            style={{ accentColor: '#0083DA', cursor: 'pointer' }}
                        />
                        {['INVOICE', 'CUSTOMER', 'DUE', 'STATUS', 'AMOUNT'].map(col => (
                            <span key={col} style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#748494',
                                letterSpacing: '0.6px',
                                textTransform: 'uppercase',
                            }}>
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Table rows */}
                    {INVOICES.map((inv, i) => {
                        const isChecked = selected.includes(inv.id);
                        return (
                            <div
                                key={inv.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '36px 1fr 1.4fr 100px 140px 110px',
                                    alignItems: 'center',
                                    padding: '13px 16px',
                                    borderBottom: i < INVOICES.length - 1 ? '1px solid #EDF2F6' : 'none',
                                    background: isChecked ? '#F0F8FF' : 'transparent',
                                    transition: 'background 0.15s',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toggleRow(inv.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleRow(inv.id)}
                                    onClick={e => e.stopPropagation()}
                                    style={{ accentColor: '#0083DA', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#102C3F' }}>
                                    {inv.id}
                                </span>
                                <span style={{ fontSize: 13, color: '#3D5166' }}>
                                    {inv.customer}
                                </span>
                                <span style={{ fontSize: 13, color: '#5F7283' }}>
                                    {inv.due}
                                </span>
                                <span>
                                    <StatusChip status={inv.status} />
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#102C3F', textAlign: 'right' }}>
                                    {fmt(inv.amount)}
                                </span>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default InvoicesPage;
