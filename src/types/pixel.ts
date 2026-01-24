export interface Pixel {
    id: string;
    created_at: number;
    expires_at: number;
    type?: "basic" | "campaign" | "tracking";
}
