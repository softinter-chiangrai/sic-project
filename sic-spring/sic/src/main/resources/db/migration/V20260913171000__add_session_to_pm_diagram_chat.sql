-- Add session_id and session_title to pm_diagram_chat
ALTER TABLE public.pm_diagram_chat 
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS session_title VARCHAR(255);

-- Populate existing records with a default session_id equal to diagram_id
UPDATE public.pm_diagram_chat 
SET session_id = diagram_id,
    session_title = 'บทสนทนาเดิม'
WHERE session_id IS NULL;

-- Create index for querying messages by diagram_id and session_id
CREATE INDEX IF NOT EXISTS idx_chat_diagram_session ON public.pm_diagram_chat (diagram_id, session_id);
