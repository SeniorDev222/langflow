from typing import Any, Dict, List, Optional

from langchain_community.llms.llamacpp import LlamaCpp

from langflow import CustomComponent
from langflow.field_typing import Text


class LlamaCppComponent(CustomComponent):
    display_name = "LlamaCppModel"
    description = "Generate text using llama.cpp model."
    documentation = "https://python.langchain.com/docs/modules/model_io/models/llms/integrations/llamacpp"

    def build_config(self):
        return {
            "grammar": {"display_name": "Grammar", "advanced": True},
            "cache": {"display_name": "Cache", "advanced": True},
            "client": {"display_name": "Client", "advanced": True},
            "echo": {"display_name": "Echo", "advanced": True},
            "f16_kv": {"display_name": "F16 KV", "advanced": True},
            "grammar_path": {"display_name": "Grammar Path", "advanced": True},
            "last_n_tokens_size": {
                "display_name": "Last N Tokens Size",
                "advanced": True,
            },
            "logits_all": {"display_name": "Logits All", "advanced": True},
            "logprobs": {"display_name": "Logprobs", "advanced": True},
            "lora_base": {"display_name": "Lora Base", "advanced": True},
            "lora_path": {"display_name": "Lora Path", "advanced": True},
            "max_tokens": {"display_name": "Max Tokens", "advanced": True},
            "metadata": {"display_name": "Metadata", "advanced": True},
            "model_kwargs": {"display_name": "Model Kwargs", "advanced": True},
            "model_path": {
                "display_name": "Model Path",
                "field_type": "file",
                "file_types": [".bin"],
                "required": True,
            },
            "n_batch": {"display_name": "N Batch", "advanced": True},
            "n_ctx": {"display_name": "N Ctx", "advanced": True},
            "n_gpu_layers": {"display_name": "N GPU Layers", "advanced": True},
            "n_parts": {"display_name": "N Parts", "advanced": True},
            "n_threads": {"display_name": "N Threads", "advanced": True},
            "repeat_penalty": {"display_name": "Repeat Penalty", "advanced": True},
            "rope_freq_base": {"display_name": "Rope Freq Base", "advanced": True},
            "rope_freq_scale": {"display_name": "Rope Freq Scale", "advanced": True},
            "seed": {"display_name": "Seed", "advanced": True},
            "stop": {"display_name": "Stop", "advanced": True},
            "streaming": {"display_name": "Streaming", "advanced": True},
            "suffix": {"display_name": "Suffix", "advanced": True},
            "tags": {"display_name": "Tags", "advanced": True},
            "temperature": {"display_name": "Temperature"},
            "top_k": {"display_name": "Top K", "advanced": True},
            "top_p": {"display_name": "Top P", "advanced": True},
            "use_mlock": {"display_name": "Use Mlock", "advanced": True},
            "use_mmap": {"display_name": "Use Mmap", "advanced": True},
            "verbose": {"display_name": "Verbose", "advanced": True},
            "vocab_only": {"display_name": "Vocab Only", "advanced": True},
            "inputs": {"display_name": "Input"},
        }

    def build(
        self,
        model_path: str,
        input_value: str,
        grammar: Optional[str] = None,
        cache: Optional[bool] = None,
        client: Optional[Any] = None,
        echo: Optional[bool] = False,
        f16_kv: bool = True,
        grammar_path: Optional[str] = None,
        last_n_tokens_size: Optional[int] = 64,
        logits_all: bool = False,
        logprobs: Optional[int] = None,
        lora_base: Optional[str] = None,
        lora_path: Optional[str] = None,
        max_tokens: Optional[int] = 256,
        metadata: Optional[Dict] = None,
        model_kwargs: Dict = {},
        n_batch: Optional[int] = 8,
        n_ctx: int = 512,
        n_gpu_layers: Optional[int] = 1,
        n_parts: int = -1,
        n_threads: Optional[int] = 1,
        repeat_penalty: Optional[float] = 1.1,
        rope_freq_base: float = 10000.0,
        rope_freq_scale: float = 1.0,
        seed: int = -1,
        stop: Optional[List[str]] = [],
        streaming: bool = True,
        suffix: Optional[str] = "",
        tags: Optional[List[str]] = [],
        temperature: Optional[float] = 0.8,
        top_k: Optional[int] = 40,
        top_p: Optional[float] = 0.95,
        use_mlock: bool = False,
        use_mmap: Optional[bool] = True,
        verbose: bool = True,
        vocab_only: bool = False,
    ) -> Text:
        output = LlamaCpp(
            model_path=model_path,
            grammar=grammar,
            cache=cache,
            client=client,
            echo=echo,
            f16_kv=f16_kv,
            grammar_path=grammar_path,
            last_n_tokens_size=last_n_tokens_size,
            logits_all=logits_all,
            logprobs=logprobs,
            lora_base=lora_base,
            lora_path=lora_path,
            max_tokens=max_tokens,
            metadata=metadata,
            model_kwargs=model_kwargs,
            n_batch=n_batch,
            n_ctx=n_ctx,
            n_gpu_layers=n_gpu_layers,
            n_parts=n_parts,
            n_threads=n_threads,
            repeat_penalty=repeat_penalty,
            rope_freq_base=rope_freq_base,
            rope_freq_scale=rope_freq_scale,
            seed=seed,
            stop=stop,
            streaming=streaming,
            suffix=suffix,
            tags=tags,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p,
            use_mlock=use_mlock,
            use_mmap=use_mmap,
            verbose=verbose,
            vocab_only=vocab_only,
        )
        message = output.invoke(input_value)
        result = message.content if hasattr(message, "content") else message
        self.status = result
        return result
        self.status = result
        return result
