export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            customers: {
                Row: {
                    id: string
                    first_name: string | null
                    last_name: string | null
                    phone: string
                    email: string | null
                    created_at: string
                    updated_at: string
                    last_interaction_date: string | null
                    total_interactions: number
                    status: 'active' | 'inactive' | 'completed'
                }
                Insert: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    phone: string
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                    last_interaction_date?: string | null
                    total_interactions?: number
                    status?: 'active' | 'inactive' | 'completed'
                }
                Update: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    phone?: string
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                    last_interaction_date?: string | null
                    total_interactions?: number
                    status?: 'active' | 'inactive' | 'completed'
                }
            }
            platforms: {
                Row: {
                    id: string
                    platform_name: string
                    platform_type: 'chatbot' | 'voice_agent'
                    is_active: boolean
                    webhook_url: string | null
                    api_key: string | null
                    icon_url: string | null
                    settings: Json | null
                    created_at: string
                    updated_at: string
                    last_sync_at: string | null
                }
                Insert: {
                    id?: string
                    platform_name: string
                    platform_type: 'chatbot' | 'voice_agent'
                    is_active?: boolean
                    webhook_url?: string | null
                    api_key?: string | null
                    icon_url?: string | null
                    settings?: Json | null
                    created_at?: string
                    updated_at?: string
                    last_sync_at?: string | null
                }
                Update: {
                    id?: string
                    platform_name?: string
                    platform_type?: 'chatbot' | 'voice_agent'
                    is_active?: boolean
                    webhook_url?: string | null
                    api_key?: string | null
                    icon_url?: string | null
                    settings?: Json | null
                    created_at?: string
                    updated_at?: string
                    last_sync_at?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    color: string | null
                    icon: string | null
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    color?: string | null
                    icon?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    color?: string | null
                    icon?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            chatbot_conversations: {
                Row: {
                    id: string
                    customer_id: string | null
                    platform_id: string | null
                    platform_type: 'whatsapp' | 'facebook' | 'instagram' | 'webchat' | 'telegram' | null
                    conversation_data: Json | null
                    summary: string | null
                    category_id: string | null
                    status: 'active' | 'completed' | 'abandoned'
                    collected_data: Json | null
                    tags: string[] | null
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    created_at: string
                    updated_at: string
                    first_message_at: string | null
                    last_message_at: string | null
                    message_count: number
                }
                Insert: {
                    id?: string
                    customer_id?: string | null
                    platform_id?: string | null
                    platform_type?: 'whatsapp' | 'facebook' | 'instagram' | 'webchat' | 'telegram' | null
                    conversation_data?: Json | null
                    summary?: string | null
                    category_id?: string | null
                    status?: 'active' | 'completed' | 'abandoned'
                    collected_data?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_at?: string
                    updated_at?: string
                    first_message_at?: string | null
                    last_message_at?: string | null
                    message_count?: number
                }
                Update: {
                    id?: string
                    customer_id?: string | null
                    platform_id?: string | null
                    platform_type?: 'whatsapp' | 'facebook' | 'instagram' | 'webchat' | 'telegram' | null
                    conversation_data?: Json | null
                    summary?: string | null
                    category_id?: string | null
                    status?: 'active' | 'completed' | 'abandoned'
                    collected_data?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_at?: string
                    updated_at?: string
                    first_message_at?: string | null
                    last_message_at?: string | null
                    message_count?: number
                }
            }
            voice_conversations: {
                Row: {
                    id: string
                    customer_id: string | null
                    call_direction: 'incoming' | 'outgoing' | null
                    phone_number: string | null
                    duration_seconds: number
                    recording_url: string | null
                    transcript: string | null
                    summary: string | null
                    category_id: string | null
                    call_status: 'answered' | 'missed' | 'failed' | 'completed' | null
                    collected_data: Json | null
                    tags: string[] | null
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    created_at: string
                    updated_at: string
                    call_started_at: string | null
                    call_ended_at: string | null
                }
                Insert: {
                    id?: string
                    customer_id?: string | null
                    call_direction?: 'incoming' | 'outgoing' | null
                    phone_number?: string | null
                    duration_seconds?: number
                    recording_url?: string | null
                    transcript?: string | null
                    summary?: string | null
                    category_id?: string | null
                    call_status?: 'answered' | 'missed' | 'failed' | 'completed' | null
                    collected_data?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_at?: string
                    updated_at?: string
                    call_started_at?: string | null
                    call_ended_at?: string | null
                }
                Update: {
                    id?: string
                    customer_id?: string | null
                    call_direction?: 'incoming' | 'outgoing' | null
                    phone_number?: string | null
                    duration_seconds?: number
                    recording_url?: string | null
                    transcript?: string | null
                    summary?: string | null
                    category_id?: string | null
                    call_status?: 'answered' | 'missed' | 'failed' | 'completed' | null
                    collected_data?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_at?: string
                    updated_at?: string
                    call_started_at?: string | null
                    call_ended_at?: string | null
                }
            }
            users: {
                Row: {
                    id: string
                    email: string | null
                    first_name: string | null
                    last_name: string | null
                    role: 'admin' | 'manager' | 'user'
                    is_active: boolean
                    permissions: Json | null
                    last_login_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    role?: 'admin' | 'manager' | 'user'
                    is_active?: boolean
                    permissions?: Json | null
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    role?: 'admin' | 'manager' | 'user'
                    is_active?: boolean
                    permissions?: Json | null
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notes: {
                Row: {
                    id: string
                    customer_id: string | null
                    conversation_id: string | null
                    conversation_type: 'chatbot' | 'voice' | null
                    user_id: string | null
                    note_content: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    customer_id?: string | null
                    conversation_id?: string | null
                    conversation_type?: 'chatbot' | 'voice' | null
                    user_id?: string | null
                    note_content?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    customer_id?: string | null
                    conversation_id?: string | null
                    conversation_type?: 'chatbot' | 'voice' | null
                    user_id?: string | null
                    note_content?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string | null
                    type: 'urgent' | 'system' | 'success' | 'warning'
                    title: string | null
                    message: string | null
                    link_url: string | null
                    is_read: boolean
                    is_archived: boolean
                    created_at: string
                    read_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    type?: 'urgent' | 'system' | 'success' | 'warning'
                    title?: string | null
                    message?: string | null
                    link_url?: string | null
                    is_read?: boolean
                    is_archived?: boolean
                    created_at?: string
                    read_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    type?: 'urgent' | 'system' | 'success' | 'warning'
                    title?: string | null
                    message?: string | null
                    link_url?: string | null
                    is_read?: boolean
                    is_archived?: boolean
                    created_at?: string
                    read_at?: string | null
                }
            }
            webhook_logs: {
                Row: {
                    id: string
                    platform_id: string | null
                    request_data: Json | null
                    response_data: Json | null
                    status_code: number | null
                    success: boolean | null
                    error_message: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    platform_id?: string | null
                    request_data?: Json | null
                    response_data?: Json | null
                    status_code?: number | null
                    success?: boolean | null
                    error_message?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    platform_id?: string | null
                    request_data?: Json | null
                    response_data?: Json | null
                    status_code?: number | null
                    success?: boolean | null
                    error_message?: string | null
                    created_at?: string
                }
            }
            tags: {
                Row: {
                    id: string
                    name: string
                    color: string | null
                    usage_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    color?: string | null
                    usage_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string | null
                    usage_count?: number
                    created_at?: string
                }
            }
            call_analytics: {
                Row: {
                    id: string
                    created_at: string
                    customer_phone: string | null
                    summary: string | null
                    category: string | null
                    duration: number | null
                    recording_url: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    customer_phone?: string | null
                    summary?: string | null
                    category?: string | null
                    duration?: number | null
                    recording_url?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    customer_phone?: string | null
                    summary?: string | null
                    category?: string | null
                    duration?: number | null
                    recording_url?: string | null
                }
            }
        }
    }
}
